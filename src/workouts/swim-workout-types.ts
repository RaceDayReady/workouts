import { z } from 'zod';
import { WorkoutIndividualItemBaseSchema, zoneNumber } from './base-workout-types';

export const SwimStrokeSchema = z.enum(['free', 'kick', 'drill', 'choice']);
export type SwimStroke = z.infer<typeof SwimStrokeSchema>;

export const SwimWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('swim'),
  zone: zoneNumber(1, 4),
  toZone: zoneNumber(1, 4).optional(),
  // Swim-specific
  target_distance_meters: z.number().min(0).optional(),
  stroke: SwimStrokeSchema.optional(),
  rest_seconds: z.number().min(0).optional(),
});
export type SwimWorkoutIndividualItem = z.infer<typeof SwimWorkoutIndividualItemSchema>;
