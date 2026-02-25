import { describe, expect, it } from 'vitest';
import { SwimWorkoutIndividualItemSchema } from './swim-workout-types';

describe('SwimWorkoutIndividualItemSchema', () => {
  it('enforces swim zones between 1 and 4', () => {
    expect(
      SwimWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'swim-ok',
        name: 'Swim Main Set',
        discipline: 'swim',
        zone: 4,
        toZone: 4,
      }).success,
    ).toBe(true);

    expect(
      SwimWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'swim-bad',
        name: 'Too High',
        discipline: 'swim',
        zone: 5,
      }).success,
    ).toBe(false);
  });
});
