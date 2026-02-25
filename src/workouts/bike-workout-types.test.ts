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
});
