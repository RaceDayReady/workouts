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

  it('accepts decimal zones up to 2 decimal places', () => {
    expect(
      SwimWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'swim-decimal',
        name: 'Swim Set',
        discipline: 'swim',
        zone: 2.5,
        toZone: 3.25,
      }).success,
    ).toBe(true);
  });

  it('rejects zones with more than 2 decimal places', () => {
    expect(
      SwimWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'swim-bad-decimal',
        name: 'Too Precise',
        discipline: 'swim',
        zone: 2.125,
      }).success,
    ).toBe(false);
  });
});
