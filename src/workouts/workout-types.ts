import { z } from 'zod';

// (OVER) Purple - Completed value is > 120% of planned values.
// (COMPLETE) Green – Completed value is +/- 20% of planned values.
// (INCOMPLETE) Yellow – Completed value is 50%-79% of planned values.
// (INCOMPLETE) Orange – Completed value is more than 50% above or below planned.
// (MISSED) Red – Workout was not completed.
export type WorkoutCompletionStatus =
  | 'over'
  | 'complete'
  | 'incomplete'
  | 'missed'
  | 'planned'
  | 'unplanned'
  | 'suggested';

const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Segments
 */

const WorkoutIndividualItemBaseSchema = z.object({
  type: z.literal('individual'),
  id: z.string().default(generateId),
  name: z.string(),
  target_duration_seconds: z.number().min(0),
  zone: z.number().min(1).max(7), // 1-4 for swim, 1-5 for run, 1-7 for bike
  toZone: z.number().min(1).max(7).optional(), // 1-4 for swim, 1-5 for run, 1-7 for bike
  rest_seconds: z.number().min(0).optional(),
});

export const SwimStrokeSchema = z.enum(['free', 'kick', 'drill', 'choice']);
export type SwimStroke = z.infer<typeof SwimStrokeSchema>;

export const SwimWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('swim'),
  target_distance_meters: z.number().min(0).optional(),
  stroke: SwimStrokeSchema.optional(),
});
export type SwimWorkoutIndividualItem = z.infer<typeof SwimWorkoutIndividualItemSchema>;

export const BikeWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('bike'),
  target_power_watts: z.number().min(0).optional(),
  target_cadence_rpm: z.number().min(0).optional(),
});
export type BikeWorkoutIndividualItem = z.infer<typeof BikeWorkoutIndividualItemSchema>;

export const RunWorkoutIndividualItemSchema = WorkoutIndividualItemBaseSchema.extend({
  discipline: z.literal('run'),
  target_distance_meters: z.number().min(0).optional(),
  target_pace_seconds_per_km: z.number().min(0).optional(),
});
export type RunWorkoutIndividualItem = z.infer<typeof RunWorkoutIndividualItemSchema>;

export const WorkoutIndividualItemSchema = z.discriminatedUnion('discipline', [
  SwimWorkoutIndividualItemSchema,
  BikeWorkoutIndividualItemSchema,
  RunWorkoutIndividualItemSchema,
]);
export type WorkoutIndividualItem = z.infer<typeof WorkoutIndividualItemSchema>;

export const WorkoutGroupItemSchema = z.object({
  type: z.literal('group'),
  id: z.string().default(generateId),
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

export function convertWorkoutIndividualItemDiscipline(
  item: WorkoutIndividualItem,
  discipline: WorkoutDiscipline,
): WorkoutIndividualItem {
  const common = {
    type: 'individual' as const,
    id: item.id,
    name: item.name,
    target_duration_seconds: item.target_duration_seconds,
    zone: item.zone,
    toZone: item.toZone,
    rest_seconds: item.rest_seconds,
  };

  if (discipline === 'swim') {
    return SwimWorkoutIndividualItemSchema.parse({
      ...common,
      discipline,
      target_distance_meters: item.discipline === 'bike' ? undefined : item.target_distance_meters,
      stroke: item.discipline === 'swim' ? item.stroke : undefined,
    });
  }

  if (discipline === 'bike') {
    return BikeWorkoutIndividualItemSchema.parse({
      ...common,
      discipline,
      target_power_watts: item.discipline === 'bike' ? item.target_power_watts : undefined,
      target_cadence_rpm: item.discipline === 'bike' ? item.target_cadence_rpm : undefined,
    });
  }

  return RunWorkoutIndividualItemSchema.parse({
    ...common,
    discipline,
    target_distance_meters: item.discipline === 'bike' ? undefined : item.target_distance_meters,
    target_pace_seconds_per_km:
      item.discipline === 'run' ? item.target_pace_seconds_per_km : undefined,
  });
}

export function convertWorkoutSegmentDiscipline(
  segment: WorkoutSegmentItem,
  discipline: WorkoutDiscipline,
): WorkoutSegmentItem {
  if (segment.type === 'group') {
    return {
      ...segment,
      segments: segment.segments.map((item) =>
        convertWorkoutIndividualItemDiscipline(item, discipline),
      ),
    };
  }

  return convertWorkoutIndividualItemDiscipline(segment, discipline);
}
