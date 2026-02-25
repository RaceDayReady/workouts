import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema } from './workout-base-types';

export const RunWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('run'),
  zone: z.number().min(1).max(5),
  toZone: z.number().min(1).max(5).optional(),
  // Run-specific
  target_distance_meters: z.number().min(0).optional(),
  target_pace_seconds_per_km: z.number().min(0).optional(),
});
export type RunWorkoutIndividualItem = z.infer<typeof RunWorkoutIndividualItemSchema>;
