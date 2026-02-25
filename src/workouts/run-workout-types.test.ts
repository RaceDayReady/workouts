import { describe, expect, it } from 'vitest';
import { RunWorkoutIndividualItemSchema } from './run-workout-types';

describe('RunWorkoutIndividualItemSchema', () => {
  it('enforces run zones between 1 and 5', () => {
    expect(
      RunWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-ok',
        name: 'Tempo',
        discipline: 'run',
        zone: 5,
      }).success,
    ).toBe(true);

    expect(
      RunWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-bad',
        name: 'Too High',
        discipline: 'run',
        zone: 6,
      }).success,
    ).toBe(false);
  });
});
