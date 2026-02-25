import { describe, expect, it } from 'vitest';
import {
  WorkoutIndividualItemSchema,
  WorkoutGroupItemSchema,
  WorkoutSegmentItemSchema,
} from './workout-types';

describe('WorkoutIndividualItemSchema', () => {
  it('accepts valid swim, bike, and run items', () => {
    expect(
      WorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'swim-1',
        name: 'Drills',
        discipline: 'swim',
        zone: 2,
      }).success,
    ).toBe(true);

    expect(
      WorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bike-1',
        name: 'Tempo',
        discipline: 'bike',
        zone: 6,
      }).success,
    ).toBe(true);

    expect(
      WorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-1',
        name: 'Endurance',
        discipline: 'run',
        zone: 3,
      }).success,
    ).toBe(true);
  });

  it('rejects items with invalid discipline', () => {
    expect(
      WorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bad',
        name: '???',
        discipline: 'yoga',
        zone: 1,
      }).success,
    ).toBe(false);
  });
});

describe('WorkoutGroupItemSchema', () => {
  it('accepts a valid group item with repeatCount and segments', () => {
    const group = {
      type: 'group',
      id: 'group-1',
      name: 'Main Set',
      repeatCount: 2,
      segments: [
        {
          type: 'individual',
          id: 'swim-set-1',
          name: 'Pace',
          discipline: 'swim',
          zone: 2,
        },
        {
          type: 'individual',
          id: 'run-set-1',
          name: 'Intervals',
          discipline: 'run',
          zone: 4,
        },
      ],
    };
    expect(WorkoutGroupItemSchema.safeParse(group).success).toBe(true);
  });

  it('rejects a group with repeatCount < 1', () => {
    const group = {
      type: 'group',
      id: 'group-bad',
      name: 'Bad Set',
      repeatCount: 0,
      segments: [
        {
          type: 'individual',
          id: 'swim-set-2',
          name: 'Long swim',
          discipline: 'swim',
          zone: 2,
        },
      ],
    };
    expect(WorkoutGroupItemSchema.safeParse(group).success).toBe(false);
  });

  it('rejects a group with no segments', () => {
    const group = {
      type: 'group',
      id: 'group-empty',
      name: 'Empty',
      repeatCount: 1,
      segments: [],
    };
    expect(WorkoutGroupItemSchema.safeParse(group).success).toBe(false);
  });
});

describe('WorkoutSegmentItemSchema', () => {
  it('accepts both group and individual items', () => {
    const individualItem = {
      type: 'individual',
      id: 'id-abc',
      name: 'Steady',
      discipline: 'bike',
      zone: 5,
    };
    const groupItem = {
      type: 'group',
      id: 'id-group',
      name: 'Brick',
      repeatCount: 1,
      segments: [
        {
          type: 'individual',
          id: 'id-xyz',
          name: 'Interval',
          discipline: 'run',
          zone: 4,
        },
      ],
    };
    expect(WorkoutSegmentItemSchema.safeParse(individualItem).success).toBe(true);
    expect(WorkoutSegmentItemSchema.safeParse(groupItem).success).toBe(true);
  });
});
