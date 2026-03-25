import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema, zone } from './base-workout-types';

export const RunWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('run'),
  zone: zone(1, 5),
  toZone: zone(1, 5).optional(),
  // Run-specific
  target_distance_meters: z.number().min(0).optional(),
  target_pace_seconds_per_km: z.number().min(0).optional(),
});
export type RunWorkoutIndividualItem = z.infer<typeof RunWorkoutIndividualItemSchema>;
