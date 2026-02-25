import WorkoutExporter from '../../export/workout-exporter';
import type { WorkoutSegmentItem, WorkoutIndividualItem } from '../../workouts/workout-types';
import type {
  GarminSwimStrokeType,
  GarminWorkout,
  GarminWorkoutStep,
  GarminWorkoutRegularStep,
  GarminWorkoutRepeatStep,
  GarminWorkoutSegment,
  GarminWorkoutSport,
} from './garmin-workout-types';
import { GarminWorkoutSchema } from './garmin-workout-types';

export interface GarminExportOptions {
  workoutName: string;
  sport: GarminWorkoutSport;
  description?: string;
}

const SWIM_STROKE_TO_GARMIN: Record<string, GarminSwimStrokeType> = {
  free: 'FREESTYLE',
  choice: 'CHOICE',
  kick: 'CHOICE',
  drill: 'MIXED',
};

function createStepOrderGenerator(): () => number {
  let currentStepOrder = 0;

  return () => {
    currentStepOrder += 1;
    return currentStepOrder;
  };
}

function getDistanceIfSupported(item: WorkoutIndividualItem): number | undefined {
  if (item.discipline !== 'swim') {
    return undefined;
  }

  return item.target_distance_meters;
}

function resolveStepDuration(item: WorkoutIndividualItem): {
  durationType: GarminWorkoutRegularStep['durationType'];
  durationValue: number;
} {
  const distance = getDistanceIfSupported(item);
  if (typeof distance === 'number' && distance > 0) {
    return {
      durationType: 'DISTANCE',
      durationValue: distance,
    };
  }

  if (typeof item.target_duration_seconds === 'number' && item.target_duration_seconds > 0) {
    return {
      durationType: 'TIME',
      durationValue: item.target_duration_seconds,
    };
  }

  return {
    durationType: 'TIME',
    durationValue: 1,
  };
}

function getRestSeconds(item: WorkoutIndividualItem): number {
  return 'rest_seconds' in item ? (item.rest_seconds ?? 0) : 0;
}

function resolveStrokeType(item: WorkoutIndividualItem): GarminSwimStrokeType | undefined {
  if (item.discipline !== 'swim' || !item.stroke) {
    return undefined;
  }

  return SWIM_STROKE_TO_GARMIN[item.stroke];
}

function mapIndividualItemToStep(
  item: WorkoutIndividualItem,
  getNextStepOrder: () => number,
): GarminWorkoutRegularStep {
  const duration = resolveStepDuration(item);

  return {
    type: 'WorkoutStep',
    stepOrder: getNextStepOrder(),
    intensity: 'ACTIVE',
    description: item.name,
    durationType: duration.durationType,
    durationValue: duration.durationValue,
    targetType: 'PACE_ZONE',
    targetValue: item.toZone ?? item.zone,
    targetValueLow: item.zone,
    targetValueHigh: item.toZone ?? item.zone,
    strokeType: resolveStrokeType(item),
  };
}

function mapGroupItemToRepeatStep(
  item: Extract<WorkoutSegmentItem, { type: 'group' }>,
  getNextStepOrder: () => number,
): GarminWorkoutRepeatStep {
  const repeatStepOrder = getNextStepOrder();
  const nestedSteps = item.segments.map((segment) =>
    mapIndividualItemToStep(segment, getNextStepOrder),
  );

  return {
    type: 'WorkoutRepeatStep',
    stepOrder: repeatStepOrder,
    intensity: 'INTERVAL',
    description: item.name ?? `Repeat x${item.repeatCount}`,
    repeatType: 'REPEAT_UNTIL_STEPS_CMPLT',
    repeatValue: item.repeatCount,
    steps: nestedSteps,
  };
}

function estimateDurationInSeconds(workoutSegments: WorkoutSegmentItem[]): number | undefined {
  let totalDurationInSeconds = 0;

  for (const item of workoutSegments) {
    if (item.type === 'group') {
      let oneLoopDurationInSeconds = 0;
      for (const segment of item.segments) {
        oneLoopDurationInSeconds +=
          (segment.target_duration_seconds ?? 0) + getRestSeconds(segment);
      }
      totalDurationInSeconds += oneLoopDurationInSeconds * item.repeatCount;
      continue;
    }

    totalDurationInSeconds += (item.target_duration_seconds ?? 0) + getRestSeconds(item);
  }

  return totalDurationInSeconds || undefined;
}

function estimateDistanceInMeters(workoutSegments: WorkoutSegmentItem[]): number | undefined {
  let totalDistanceInMeters = 0;

  for (const item of workoutSegments) {
    if (item.type === 'group') {
      let oneLoopDistanceInMeters = 0;
      for (const segment of item.segments) {
        if (segment.discipline === 'bike') {
          continue;
        }
        oneLoopDistanceInMeters += segment.target_distance_meters ?? 0;
      }
      totalDistanceInMeters += oneLoopDistanceInMeters * item.repeatCount;
      continue;
    }

    if (item.discipline === 'bike') {
      continue;
    }

    totalDistanceInMeters += item.target_distance_meters ?? 0;
  }

  return totalDistanceInMeters || undefined;
}

function assertPositiveDuration(step: GarminWorkoutRegularStep): void {
  if (typeof step.durationValue !== 'number' || step.durationValue <= 0) {
    throw new Error(`Garmin step "${step.description ?? 'unnamed'}" has invalid durationValue`);
  }
}

function validateNoDuplicateStepOrders(steps: GarminWorkoutStep[]): void {
  const seenStepOrders = new Set<number>();

  for (const topLevelStep of steps) {
    if (typeof topLevelStep.stepOrder === 'number') {
      if (seenStepOrders.has(topLevelStep.stepOrder)) {
        throw new Error(`Duplicate Garmin stepOrder detected: ${topLevelStep.stepOrder}`);
      }
      seenStepOrders.add(topLevelStep.stepOrder);
    }

    if (topLevelStep.type === 'WorkoutRepeatStep') {
      for (const nestedStep of topLevelStep.steps) {
        if (typeof nestedStep.stepOrder === 'number') {
          if (seenStepOrders.has(nestedStep.stepOrder)) {
            throw new Error(`Duplicate Garmin stepOrder detected: ${nestedStep.stepOrder}`);
          }
          seenStepOrders.add(nestedStep.stepOrder);
        }
      }
    }
  }
}

function validatePositiveDurations(steps: GarminWorkoutStep[]): void {
  for (const topLevelStep of steps) {
    if (topLevelStep.type === 'WorkoutStep') {
      assertPositiveDuration(topLevelStep);
      continue;
    }

    for (const nestedStep of topLevelStep.steps) {
      assertPositiveDuration(nestedStep);
    }
  }
}

function buildGarminSteps(workoutSegments: WorkoutSegmentItem[]): GarminWorkoutStep[] {
  const getNextStepOrder = createStepOrderGenerator();
  const steps: GarminWorkoutStep[] = [];

  for (const item of workoutSegments) {
    if (item.type === 'group') {
      steps.push(mapGroupItemToRepeatStep(item, getNextStepOrder));
    } else {
      steps.push(mapIndividualItemToStep(item, getNextStepOrder));
    }
  }

  validateNoDuplicateStepOrders(steps);
  validatePositiveDurations(steps);

  return steps;
}

export class GarminExporter implements WorkoutExporter<GarminWorkout> {
  private readonly options: GarminExportOptions;

  constructor(options: GarminExportOptions) {
    this.options = options;
  }

  async export(workoutSegments: WorkoutSegmentItem[]): Promise<GarminWorkout> {
    const segment: GarminWorkoutSegment = {
      sport: this.options.sport,
      estimatedDurationInSecs: estimateDurationInSeconds(workoutSegments),
      estimatedDistanceInMeters: estimateDistanceInMeters(workoutSegments),
      steps: buildGarminSteps(workoutSegments),
    };

    return GarminWorkoutSchema.parse({
      workoutName: this.options.workoutName,
      description: this.options.description,
      sport: this.options.sport,
      estimatedDurationInSecs: segment.estimatedDurationInSecs,
      estimatedDistanceInMeters: segment.estimatedDistanceInMeters,
      segments: [segment],
    });
  }
}
