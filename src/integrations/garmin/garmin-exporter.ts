import WorkoutExporter from '../../export/workout-exporter';
import type { WorkoutSegmentItem, WorkoutIndividualItem } from '../../workouts/workout-types';
import type {
  GarminSwimStrokeType,
  GarminWorkout,
  GarminWorkoutRegularStep,
  GarminWorkoutRepeatStep,
  GarminWorkoutSegment,
  GarminWorkoutSport,
} from './garmin-workout-types';

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

function mapIndividualToRegularStep(
  item: WorkoutIndividualItem,
  stepOrder: number,
): GarminWorkoutRegularStep {
  const hasDistance =
    (item.discipline === 'swim' || item.discipline === 'run') &&
    typeof item.target_distance_meters === 'number';
  const strokeType =
    item.discipline === 'swim' && item.stroke ? SWIM_STROKE_TO_GARMIN[item.stroke] : undefined;

  return {
    type: 'WorkoutStep',
    stepOrder,
    intensity: item.rest_seconds && item.rest_seconds > 0 ? 'RECOVERY' : 'ACTIVE',
    description: item.name,
    durationType: hasDistance ? 'DISTANCE' : 'TIME',
    durationValue:
      hasDistance && (item.discipline === 'swim' || item.discipline === 'run')
        ? item.target_distance_meters
        : item.target_duration_seconds,
    targetType: 'PACE_ZONE',
    targetValue: item.toZone ?? item.zone,
    targetValueLow: item.zone,
    targetValueHigh: item.toZone ?? item.zone,
    strokeType,
  };
}

function mapGroupToRepeatStep(
  item: Extract<WorkoutSegmentItem, { type: 'group' }>,
  stepOrder: number,
): GarminWorkoutRepeatStep {
  const steps = item.segments.map((segment, idx) => mapIndividualToRegularStep(segment, idx + 1));

  return {
    type: 'WorkoutRepeatStep',
    stepOrder,
    intensity: 'INTERVAL',
    description: item.name ?? `Repeat x${item.repeatCount}`,
    repeatType: 'REPEAT_UNTIL_STEPS_CMPLT',
    repeatValue: item.repeatCount,
    steps,
  };
}

function buildGarminSegment(
  workoutSegments: WorkoutSegmentItem[],
  sport: GarminWorkoutSport,
): GarminWorkoutSegment {
  const steps = workoutSegments.map((item, idx) => {
    if (item.type === 'group') {
      return mapGroupToRepeatStep(item, idx + 1);
    }

    return mapIndividualToRegularStep(item, idx + 1);
  });

  const estimatedDurationInSecs = workoutSegments.reduce((total, item) => {
    if (item.type === 'group') {
      const groupDuration = item.segments.reduce((segmentTotal, segment) => {
        return segmentTotal + segment.target_duration_seconds + (segment.rest_seconds ?? 0);
      }, 0);

      return total + groupDuration * item.repeatCount;
    }

    return total + item.target_duration_seconds + (item.rest_seconds ?? 0);
  }, 0);

  const estimatedDistanceInMeters = workoutSegments.reduce((total, item) => {
    if (item.type === 'group') {
      const groupDistance = item.segments.reduce((segmentTotal, segment) => {
        if (segment.discipline === 'bike') {
          return segmentTotal;
        }

        return segmentTotal + (segment.target_distance_meters ?? 0);
      }, 0);

      return total + groupDistance * item.repeatCount;
    }

    if (item.discipline === 'bike') {
      return total;
    }

    return total + (item.target_distance_meters ?? 0);
  }, 0);

  return {
    sport,
    estimatedDurationInSecs: estimatedDurationInSecs || undefined,
    estimatedDistanceInMeters: estimatedDistanceInMeters || undefined,
    steps,
  };
}

export function exportWorkoutToGarmin(
  workoutSegments: WorkoutSegmentItem[],
  options: GarminExportOptions,
): GarminWorkout {}

// TODO
export class GarminExporter implements WorkoutExporter<GarminWorkout> {
  private readonly options: GarminExportOptions;

  constructor(options: GarminExportOptions) {
    this.options = options;
  }

  async export(workoutSegments: WorkoutSegmentItem[]): Promise<GarminWorkout> {
    const segment = buildGarminSegment(workoutSegments, this.options.sport);

    // TODO
    return {
      workoutName: this.options.workoutName,
      description: this.options.description,
      sport: this.options.sport,
      estimatedDurationInSecs: segment.estimatedDurationInSecs,
      estimatedDistanceInMeters: segment.estimatedDistanceInMeters,
      segments: [segment],
    };
  }
}
