import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema } from './base-workout-types';

export const BikeWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('bike'),
  zone: z.number().min(1).max(7),
  toZone: z.number().min(1).max(7).optional(),
  // Bike-specific
  target_power_watts: z.number().min(0).optional(),
  target_cadence_rpm: z.number().min(0).optional(),
});
export type BikeWorkoutIndividualItem = z.infer<typeof BikeWorkoutIndividualItemSchema>;
