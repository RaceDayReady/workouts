import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema } from './base-workout-types';

export const StrengthWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('strength'),
  exercise: z.string(),
  sets: z.number().min(1).optional(),
  reps: z.number().min(1).optional(),
  weight_kg: z.number().min(0).optional(),
  rest_seconds: z.number().min(0).optional(),
});
export type StrengthWorkoutIndividualItem = z.infer<typeof StrengthWorkoutIndividualItemSchema>;
