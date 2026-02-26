import { describe, expect, it } from 'vitest';
import {
  getTotalDistanceMeters,
  getTotalDurationSeconds,
  getTotalSegmentCount,
} from './workout-utils';
import type { WorkoutGroupItem, WorkoutIndividualItem, WorkoutSegmentItem } from './workout-types';

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
