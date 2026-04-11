import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema, zone } from './base-workout-types';

export const BikeWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('bike'),
  zone: zone(1, 7),
  toZone: zone(1, 7).optional(),
  // Bike-specific
  target_duration_seconds: z.number().min(0).optional(),
  target_power_watts: z.number().min(0).optional(),
  target_cadence_rpm: z.number().min(0).optional(),
});
export type BikeWorkoutIndividualItem = z.infer<typeof BikeWorkoutIndividualItemSchema>;
