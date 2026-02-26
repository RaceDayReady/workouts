import { z } from 'zod';
import { generateWorkoutItemId } from './workout-utils';

export const WorkoutIndividualItemBaseSchema = z.object({
  type: z.literal('individual'),
  id: z.string().default(generateWorkoutItemId),
  name: z.string(),
  target_duration_seconds: z.number().min(0).optional(),
  // Discipline-specific ranges are enforced in discipline-specific schemas
  zone: z.number().min(1),
  toZone: z.number().min(1).optional(),
});
