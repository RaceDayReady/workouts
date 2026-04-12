import { z } from 'zod';
import { generateWorkoutItemId } from './workout-utils';
import { SwimStrokeSchema } from './swim-workout-types';

/** Zone: supports up to 2 decimal places (e.g. 2, 3.5, 4.25) */
export function zone(min: number, max: number) {
  return z.number().min(min).max(max).multipleOf(0.01);
}

export const WorkoutIndividualItemSchema = z.object({
  type: z.literal('individual'),
  id: z.string().default(generateWorkoutItemId),
  name: z.string(),
  zone: zone(1, 7),
  toZone: zone(1, 7).optional(),

  // Bike + run
  target_duration_seconds: z.number().min(0).optional(),

  // Bike
  target_cadence_rpm: z.number().min(0).optional(),

  // Swim
  target_distance_meters: z.number().min(0).optional(),
  stroke: SwimStrokeSchema.optional(),
  rest_seconds: z.number().min(0).optional(),
});
export type WorkoutIndividualItem = z.infer<typeof WorkoutIndividualItemSchema>;

export const WorkoutGroupItemSchema = z.object({
  type: z.literal('group'),
  id: z.string().default(generateWorkoutItemId),
  name: z.string().optional(),
  repeatCount: z.number().min(1).default(1),
  segments: z.array(WorkoutIndividualItemSchema).min(1),
});
export type WorkoutGroupItem = z.infer<typeof WorkoutGroupItemSchema>;

export const WorkoutSegmentItemSchema = z.union([
  WorkoutGroupItemSchema,
  WorkoutIndividualItemSchema,
]);
export type WorkoutSegmentItem = z.infer<typeof WorkoutSegmentItemSchema>;

export const WorkoutDisciplineSchema = z.enum(['swim', 'bike', 'run']);
export type WorkoutDiscipline = z.infer<typeof WorkoutDisciplineSchema>;
