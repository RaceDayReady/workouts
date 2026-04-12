import { describe, expect, it } from 'vitest';
import {
  flattenSegmentItems,
  generateWorkoutItemId,
  getTotalDistanceMeters,
  getTotalDurationSeconds,
  getTotalSegmentCount,
} from './workout-utils';
import type { WorkoutSegmentItem } from './workout-types';

const swim = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 's',
    name: 's',
    zone: 2,
    ...overrides,
  }) as WorkoutSegmentItem;

const bike = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 'b',
    name: 'b',
    zone: 4,
    ...overrides,
  }) as WorkoutSegmentItem;

const run = (overrides?: Partial<WorkoutSegmentItem>): WorkoutSegmentItem =>
  ({
    type: 'individual',
    id: 'r',
    name: 'r',
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

describe('flattenSegmentItems', () => {
  it('returns individuals as-is', () => {
    const segments = [swim(), bike()];
    expect(flattenSegmentItems(segments)).toEqual(segments);
  });

  it('flattens groups and repeats by repeatCount', () => {
    const s = swim();
    const b = bike();
    const segments = [run(), group(3, [s, b])];
    expect(flattenSegmentItems(segments)).toEqual([run(), s, b, s, b, s, b]);
  });

  it('flattens nested groups with repeatCount', () => {
    const s = swim();
    const segments = [group(2, [group(2, [s])])];
    expect(flattenSegmentItems(segments)).toEqual([s, s, s, s]);
  });
});
