import { describe, expect, it } from 'vitest';
import { BikeWorkoutIndividualItemSchema } from './bike-workout-types';

describe('BikeWorkoutIndividualItemSchema', () => {
  it('enforces bike zones between 1 and 7', () => {
    expect(
      BikeWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bike-ok',
        name: 'Threshold',
        discipline: 'bike',
        zone: 7,
      }).success,
    ).toBe(true);

    expect(
      BikeWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bike-bad',
        name: 'Too High',
        discipline: 'bike',
        zone: 8,
      }).success,
    ).toBe(false);
  });

  it('accepts decimal zones up to 2 decimal places', () => {
    expect(
      BikeWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bike-decimal',
        name: 'Sweet Spot',
        discipline: 'bike',
        zone: 4.5,
      }).success,
    ).toBe(true);
  });

  it('rejects zones with more than 2 decimal places', () => {
    expect(
      BikeWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'bike-bad-decimal',
        name: 'Too Precise',
        discipline: 'bike',
        zone: 4.125,
      }).success,
    ).toBe(false);
  });
});
