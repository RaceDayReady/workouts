import { z } from 'zod';

/**
 * Enums
 */

export const GarminWorkoutSportSchema = z.enum([
  'RUNNING',
  'CYCLING',
  'LAP_SWIMMING',
  // Not supported for now:
  // 'STRENGTH_TRAINING',
  // 'CARDIO_TRAINING',
  // 'GENERIC',
  // 'YOGA',
  // 'PILATES',
  // 'MULTI_SPORT',
]);
export type GarminWorkoutSport = z.infer<typeof GarminWorkoutSportSchema>;

const GarminPoolLengthUnitSchema = z.enum(['YARD', 'METER']);
export type GarminPoolLengthUnit = z.infer<typeof GarminPoolLengthUnitSchema>;

const GarminWorkoutRepeatTypeSchema = z.enum([
  'REPEAT_UNTIL_STEPS_CMPLT',
  'REPEAT_UNTIL_TIME',
  'REPEAT_UNTIL_DISTANCE',
  // Not supported for now:
  // 'REPEAT_UNTIL_CALORIES',
  // 'REPEAT_UNTIL_HR_LESS_THAN',
  // 'REPEAT_UNTIL_HR_GREATER_THAN',
  // 'REPEAT_UNTIL_POWER_LESS_THAN',
  // 'REPEAT_UNTIL_POWER_GREATER_THAN',
  // 'REPEAT_UNTIL_POWER_LAST_LAP_LESS_THAN',
  // 'REPEAT_UNTIL_MAX_POWER_LAST_LAP_LESS_THAN',
]);
export type GarminWorkoutRepeatType = z.infer<typeof GarminWorkoutRepeatTypeSchema>;

export const GarminWorkoutStepIntensitySchema = z.enum([
  'REST',
  'WARMUP',
  'COOLDOWN',
  'RECOVERY',
  'ACTIVE',
  'INTERVAL',
  'MAIN', // SWIM ONLY
]);
export type GarminWorkoutStepIntensity = z.infer<typeof GarminWorkoutStepIntensitySchema>;

export const GarminWorkoutStepDurationTypeSchema = z.enum([
  'TIME',
  'DISTANCE',
  'HR_LESS_THAN',
  'HR_GREATER_THAN',
  'CALORIES',
  'OPEN',
  'POWER_LESS_THAN',
  'POWER_GREATER_THAN',
  'TIME_AT_VALID_CDA',
  'FIXED_REST',
  'REPS',
  'FIXED_REPETITION',
  'REPETITION_SWIM_CSS_OFFSET',
]);
export type GarminWorkoutStepDurationType = z.infer<typeof GarminWorkoutStepDurationTypeSchema>;

export const GarminWorkoutStepTargetTypeSchema = z.enum([
  'SPEED',
  'HEART_RATE',
  'CADENCE',
  'POWER',
  'GRADE',
  'RESISTANCE',
  'POWER_3S',
  'POWER_10S',
  'POWER_30S',
  'POWER_LAP',
  'SPEED_LAP',
  'HEART_RATE_LAP',
  'PACE',
  'OPEN',
  'SWIM_INSTRUCTION',
  'SWIM_CSS_OFFSET',
  'PACE_ZONE',
]);
export type GarminWorkoutStepTargetType = z.infer<typeof GarminWorkoutStepTargetTypeSchema>;

export const GarminSwimStrokeTypeSchema = z.enum([
  'BACKSTROKE',
  'BREASTSTROKE',
  'BUTTERFLY',
  'FREESTYLE',
  'MIXED',
  'IM',
  'RIMO',
  'CHOICE',
]);
export type GarminSwimStrokeType = z.infer<typeof GarminSwimStrokeTypeSchema>;

export const GarminSwimDrillTypeSchema = z.enum(['KICK', 'PULL', 'BUTTERFLY']);
export type GarminSwimDrillType = z.infer<typeof GarminSwimDrillTypeSchema>;

export const GarminSwimEquipmentTypeSchema = z.enum([
  'NONE',
  'SWIM_FINS',
  'SWIM_KICKBOARD',
  'SWIM_PADDLES',
  'SWIM_PULL_BUOY',
  'SWIM_SNORKEL',
]);
export type GarminSwimEquipmentType = z.infer<typeof GarminSwimEquipmentTypeSchema>;

export const GarminWeightDisplayUnitSchema = z.enum(['KILOGRAM', 'POUND']);
export type GarminWeightDisplayUnit = z.infer<typeof GarminWeightDisplayUnitSchema>;

/**
 * Step
 */

export const GarminWorkoutStepBaseSchema = z.object({
  stepId: z.number().optional(), // Set by server, ignored for create
  stepOrder: z.number().optional(),
  intensity: GarminWorkoutStepIntensitySchema.optional(),
  description: z.string().max(512).optional(),
  durationType: GarminWorkoutStepDurationTypeSchema.optional(),
  durationValue: z.number().optional(),
  durationValueType: z.string().optional(), // e.g. "PERCENT"
  targetType: GarminWorkoutStepTargetTypeSchema.nullable().optional(),
  targetValue: z.number().nullable().optional(),
  targetValueLow: z.number().nullable().optional(),
  targetValueHigh: z.number().nullable().optional(),
  targetValueType: z.string().optional(), // e.g. "PERCENT"
  secondaryTargetType: GarminWorkoutStepTargetTypeSchema.nullable().optional(),
  secondaryTargetValue: z.number().nullable().optional(),
  secondaryTargetValueLow: z.number().nullable().optional(),
  secondaryTargetValueHigh: z.number().nullable().optional(),
  secondaryTargetValueType: z.string().optional(),
  strokeType: GarminSwimStrokeTypeSchema.optional(),
  drillType: GarminSwimDrillTypeSchema.optional(),
  equipmentType: GarminSwimEquipmentTypeSchema.optional(),
  exerciseCategory: z.string().optional(),
  exerciseName: z.string().optional(),
  weightValue: z.number().optional(),
  weightDisplayUnit: GarminWeightDisplayUnitSchema.optional(),
  skipLastRestStep: z.boolean().optional(),
});

export const GarminWorkoutRegularStepSchema = GarminWorkoutStepBaseSchema.extend({
  type: z.literal('WorkoutStep'),
});
export type GarminWorkoutRegularStep = z.infer<typeof GarminWorkoutRegularStepSchema>;

export const GarminWorkoutRepeatStepSchema = GarminWorkoutStepBaseSchema.extend({
  type: z.literal('WorkoutRepeatStep'),
  repeatType: GarminWorkoutRepeatTypeSchema,
  repeatValue: z.number(),
  steps: z.array(GarminWorkoutRegularStepSchema),
});
export type GarminWorkoutRepeatStep = z.infer<typeof GarminWorkoutRepeatStepSchema>;

export const GarminWorkoutStepSchema = z.discriminatedUnion('type', [
  GarminWorkoutRegularStepSchema,
  GarminWorkoutRepeatStepSchema,
]);
export type GarminWorkoutStep = z.infer<typeof GarminWorkoutStepSchema>;

/**
 * Segment
 */

export const GarminWorkoutSegmentSchema = z.object({
  segmentOrder: z.number().optional(),
  sport: GarminWorkoutSportSchema,
  estimatedDurationInSecs: z.number().optional(),
  estimatedDistanceInMeters: z.number().optional(),
  poolLength: z.number().optional(),
  poolLengthUnit: GarminPoolLengthUnitSchema.optional(),
  steps: z.array(GarminWorkoutStepSchema),
});
export type GarminWorkoutSegment = z.infer<typeof GarminWorkoutSegmentSchema>;

/**
 * Workout
 * One segment per sport type.
 */

export const GarminWorkoutSchema = z.object({
  workoutId: z.number().optional(),
  ownerId: z.number().optional(),
  workoutName: z.string(),
  description: z.string().max(1024).optional(),
  updatedDate: z.string().optional(), // ISO 8601
  createdDate: z.string().optional(), // ISO 8601
  sport: GarminWorkoutSportSchema,
  estimatedDurationInSecs: z.number().optional(),
  estimatedDistanceInMeters: z.number().optional(),
  poolLength: z.number().optional(),
  poolLengthUnit: GarminPoolLengthUnitSchema.optional(),
  workoutProvider: z.string().max(20).optional(),
  workoutSourceId: z.string().max(20).optional(),
  isSessionTransitionEnabled: z.boolean().optional(),
  segments: z.array(GarminWorkoutSegmentSchema).optional(),
});
export type GarminWorkout = z.infer<typeof GarminWorkoutSchema>;
