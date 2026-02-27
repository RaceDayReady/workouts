import { describe, expect, it } from 'vitest';
import {
  generateWorkoutItemId,
  getDistanceMeters,
  getDurationSeconds,
  getTotalDistanceMeters,
  getTotalDurationSeconds,
  getTotalSegmentCount,
} from './workout-utils';
import {
  WorkoutGroupItemSchema,
  WorkoutIndividualItemSchema,
  type WorkoutGroupItem,
  type WorkoutIndividualItem,
  type WorkoutSegmentItem,
} from './workout-types';

const swim = (
  id: string,
  overrides?: Partial<{ target_distance_meters: number; target_duration_seconds: number }>,
): WorkoutIndividualItem => ({
  type: 'individual',
  id,
  name: id,
  discipline: 'swim',
  zone: 2,
  ...overrides,
});

const bike = (
  id: string,
  overrides?: Partial<{ target_duration_seconds: number }>,
): WorkoutIndividualItem => ({
  type: 'individual',
  id,
  name: id,
  discipline: 'bike',
  zone: 4,
  ...overrides,
});

const group = (repeatCount: number, segments: WorkoutSegmentItem[]): WorkoutGroupItem => ({
  type: 'group',
  id: 'group',
  repeatCount,
  segments: segments as unknown as WorkoutIndividualItem[],
});

describe('getTotalDistanceMeters', () => {
  it('sums individuals and groups, treating missing distance as 0', () => {
    const segments: WorkoutSegmentItem[] = [
      swim('warmup', { target_distance_meters: 400 }),
      group(3, [
        swim('fast', { target_distance_meters: 100 }),
        swim('easy', { target_distance_meters: 50 }),
      ]),
      bike('tempo'), // no distance field
    ];
    expect(getTotalDistanceMeters(segments)).toBe(850);
  });
});

describe('getTotalDurationSeconds', () => {
  it('sums individuals and groups, treating missing duration as 0', () => {
    const segments: WorkoutSegmentItem[] = [
      bike('warmup', { target_duration_seconds: 600 }),
      group(3, [
        bike('on', { target_duration_seconds: 300 }),
        bike('off', { target_duration_seconds: 300 }),
      ]),
      swim('cooldown'), // no duration
    ];
    expect(getTotalDurationSeconds(segments)).toBe(2400);
  });
});

describe('getTotalSegmentCount', () => {
  it('counts individuals as 1 and group segments multiplied by repeatCount', () => {
    const segments: WorkoutSegmentItem[] = [
      swim('warmup'),
      group(3, [swim('on'), swim('off')]),
      swim('cooldown'),
    ];
    expect(getTotalSegmentCount(segments)).toBe(8);
  });
});

describe('getDistanceMeters', () => {
  it('returns target_distance_meters for an individual', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'swim',
      type: 'individual',
      id: 'foo',
      name: 'swim',
      zone: 2,
      target_distance_meters: 400,
    });
    expect(getDistanceMeters(item)).toBe(400);
  });

  it('returns zero for an individual without target_distance_meters', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'swim',
      type: 'individual',
      id: 'foo',
      name: 'swim',
      zone: 2,
    });
    expect(getDistanceMeters(item)).toBe(0);
  });

  it('returns zero if target_distance_meters is null or undefined', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'swim',
      type: 'individual',
      id: 'foo',
      name: 'swim',
      zone: 2,
      target_distance_meters: undefined,
    });
    expect(getDistanceMeters(item)).toBe(0);
  });

  it('aggregates distance for a group (repeatCount)', () => {
    const item = WorkoutGroupItemSchema.parse({
      type: 'group',
      id: 'grp',
      repeatCount: 2,
      segments: [
        WorkoutIndividualItemSchema.parse({
          discipline: 'swim',
          type: 'individual',
          id: 'a',
          name: 'swim',
          zone: 2,
          target_distance_meters: 100,
        }),
        WorkoutIndividualItemSchema.parse({
          discipline: 'swim',
          type: 'individual',
          id: 'b',
          name: 'swim',
          zone: 2,
          target_distance_meters: 50,
        }),
      ],
    });
    // (100+50) * 2 = 300
    expect(getDistanceMeters(item)).toBe(300);
  });
});

describe('getDurationSeconds', () => {
  it('returns target_duration_seconds for an individual', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'bike',
      type: 'individual',
      id: 'foo',
      name: 'bike',
      zone: 3,
      target_duration_seconds: 120,
    });
    expect(getDurationSeconds(item)).toBe(120);
  });

  it('returns zero for an individual without target_duration_seconds', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'bike',
      type: 'individual',
      id: 'foo',
      name: 'bike',
      zone: 3,
    });
    expect(getDurationSeconds(item)).toBe(0);
  });

  it('returns zero if target_duration_seconds is undefined', () => {
    const item = WorkoutIndividualItemSchema.parse({
      discipline: 'bike',
      type: 'individual',
      id: 'foo',
      name: 'bike',
      zone: 3,
      target_duration_seconds: undefined,
    });
    expect(getDurationSeconds(item)).toBe(0);
  });

  it('aggregates duration for a group (repeatCount)', () => {
    const item = WorkoutGroupItemSchema.parse({
      type: 'group',
      id: 'grp',
      repeatCount: 4,
      segments: [
        WorkoutIndividualItemSchema.parse({
          discipline: 'bike',
          type: 'individual',
          id: 'c',
          name: 'bike',
          zone: 3,
          target_duration_seconds: 60,
        }),
        WorkoutIndividualItemSchema.parse({
          discipline: 'bike',
          type: 'individual',
          id: 'd',
          name: 'bike',
          zone: 3,
          target_duration_seconds: 90,
        }),
      ],
    });
    // (60+90) * 4 = 600
    expect(getDurationSeconds(item)).toBe(600);
  });
});

describe('generateWorkoutItemId', () => {
  it('returns a non-empty string of reasonable length', () => {
    const id = generateWorkoutItemId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThanOrEqual(3);
    expect(id.length).toBeLessThanOrEqual(8); // 7 chars per substring(2,9)
  });

  it('returns unique values on repeated calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      ids.add(generateWorkoutItemId());
    }
    expect(ids.size).toBe(10);
  });
});
