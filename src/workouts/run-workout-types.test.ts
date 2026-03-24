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

  it('accepts decimal zones up to 2 decimal places', () => {
    expect(
      RunWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-decimal',
        name: 'Tempo',
        discipline: 'run',
        zone: 3.5,
      }).success,
    ).toBe(true);

    expect(
      RunWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-decimal-2',
        name: 'Tempo',
        discipline: 'run',
        zone: 2.75,
      }).success,
    ).toBe(true);
  });

  it('rejects zones with more than 2 decimal places', () => {
    expect(
      RunWorkoutIndividualItemSchema.safeParse({
        type: 'individual',
        id: 'run-bad-decimal',
        name: 'Too Precise',
        discipline: 'run',
        zone: 3.125,
      }).success,
    ).toBe(false);
  });
});
