import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema } from './base-workout-types';

export const StretchingWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('stretching'),
  exercise: z.string(),
  hold_seconds: z.number().min(0).optional(),
  reps: z.number().min(1).optional(),
  sets: z.number().min(1).optional(),
  side: z.enum(['left', 'right', 'both']).optional(),
});
export type StretchingWorkoutIndividualItem = z.infer<typeof StretchingWorkoutIndividualItemSchema>;
