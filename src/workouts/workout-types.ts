import { z } from 'zod';
import { BikeWorkoutIndividualItemSchema } from './bike-workout-types';
import { generateWorkoutItemId } from './workout-utils';
import { RunWorkoutIndividualItemSchema } from './run-workout-types';
import { StrengthWorkoutIndividualItemSchema } from './strength-workout-types';
import { StretchingWorkoutIndividualItemSchema } from './stretching-workout-types';
import { SwimWorkoutIndividualItemSchema } from './swim-workout-types';

export const WorkoutIndividualItemSchema = z.discriminatedUnion('discipline', [
  SwimWorkoutIndividualItemSchema,
  BikeWorkoutIndividualItemSchema,
  RunWorkoutIndividualItemSchema,
  StrengthWorkoutIndividualItemSchema,
  StretchingWorkoutIndividualItemSchema,
]);
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

export const WorkoutDisciplineSchema = z.enum(['swim', 'bike', 'run', 'strength', 'stretching']);
export type WorkoutDiscipline = z.infer<typeof WorkoutDisciplineSchema>;
