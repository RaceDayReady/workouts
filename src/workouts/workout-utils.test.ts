import { describe, expect, it } from 'vitest';
import {
  generateWorkoutItemId,
  getTotalDistanceMeters,
  getTotalDurationSeconds,
  getTotalSegmentCount,
  getWeight,
} from './workout-utils';
import type { WorkoutSegmentItem } from './workout-types';

const swim = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 's',
    name: 's',
    discipline: 'swim',
    zone: 2,
    ...overrides,
  }) as WorkoutSegmentItem;

const bike = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 'b',
    name: 'b',
    discipline: 'bike',
    zone: 4,
    ...overrides,
  }) as WorkoutSegmentItem;

const run = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 'r',
    name: 'r',
    discipline: 'run',
    zone: 2,
    ...overrides,
  }) as WorkoutSegmentItem;

const group = (repeatCount: number, segments: WorkoutSegmentItem[]): WorkoutSegmentItem =>
  ({ type: 'group', id: 'g', repeatCount, segments }) as WorkoutSegmentItem;

describe('generateWorkoutItemId', () => {
  it('returns unique non-empty strings', () => {
    const id1 = generateWorkoutItemId();
    const id2 = generateWorkoutItemId();
    expect(id1).not.toBe('');
    expect(id1).not.toBe(id2);
  });
});

describe('getTotalDistanceMeters', () => {
  it('sums individuals and groups, treating missing distance as 0', () => {
    const segments = [
      swim({ target_distance_meters: 100 }),
      bike(), // no distance field
      group(2, [swim({ target_distance_meters: 50 })]),
    ];
    expect(getTotalDistanceMeters(segments)).toBe(100 + 2 * 50);
  });
});

describe('getTotalDurationSeconds', () => {
  it('sums individuals and groups, treating missing duration as 0', () => {
    const segments = [
      bike({ target_duration_seconds: 100 }),
      swim(), // no duration
      group(2, [bike({ target_duration_seconds: 25 })]),
    ];
    expect(getTotalDurationSeconds(segments)).toBe(100 + 2 * 25);
  });
});

describe('getTotalSegmentCount', () => {
  it('counts individuals as 1 and group segments multiplied by repeatCount', () => {
    const segments = [swim(), group(3, [swim(), swim()])];
    expect(getTotalSegmentCount(segments)).toBe(1 + 3 * 2);
  });
});

describe('getWeight', () => {
  it('uses distance for swim and duration for bike/run', () => {
    expect(getWeight(swim({ target_distance_meters: 55 }))).toBe(55);
    expect(getWeight(run({ target_duration_seconds: 100 }))).toBe(100);
    expect(getWeight(bike({ target_duration_seconds: 200 }))).toBe(200);
  });

  it('returns 0 when value is missing', () => {
    expect(getWeight(swim())).toBe(0);
    expect(getWeight(run())).toBe(0);
  });
});
