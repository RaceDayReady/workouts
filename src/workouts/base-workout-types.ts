import { z } from 'zod';
import { generateWorkoutItemId } from './workout-utils';

/** Zone: supports up to 2 decimal places (e.g. 2, 3.5, 4.25) */
export function zone(min: number, max: number) {
  return z.number().min(min).max(max).multipleOf(0.01);
}

export const WorkoutIndividualItemBaseSchema = z.object({
  type: z.literal('individual'),
  id: z.string().default(generateWorkoutItemId),
  name: z.string(),
  // Discipline-specific ranges are enforced in discipline-specific schemas
  zone: zone(1, Infinity),
  toZone: zone(1, Infinity).optional(),
});
