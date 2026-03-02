import type { WorkoutIndividualItem, WorkoutSegmentItem } from './workout-types';

export const generateWorkoutItemId = () => Math.random().toString(36).substring(2, 9);

/**
 * Individual item utils
 */

export function getDistanceMeters(item: WorkoutSegmentItem): number {
  if (item.type === 'group') {
    return (
      item.segments.reduce(
        (sum: number, item: WorkoutSegmentItem) => sum + getDistanceMeters(item),
        0,
      ) * item.repeatCount
    );
  }

  return 'target_distance_meters' in item ? (item.target_distance_meters ?? 0) : 0;
}

export function getDurationSeconds(item: WorkoutSegmentItem): number {
  if (item.type === 'group') {
    return (
      item.segments.reduce(
        (sum: number, item: WorkoutSegmentItem) => sum + getDurationSeconds(item),
        0,
      ) * item.repeatCount
    );
  }

  return 'target_duration_seconds' in item ? (item.target_duration_seconds ?? 0) : 0;
}

export function getWeight(item: WorkoutSegmentItem): number {
  if (item.type === 'group') {
    return (
      item.segments.reduce((total, segment) => total + getWeight(segment), 0) * item.repeatCount
    );
  }

  if (item.discipline === 'swim') {
    return getDistanceMeters(item);
  }

  return getDurationSeconds(item);
}

/**
 * Aggregates
 */

export function getTotalDistanceMeters(segments: WorkoutSegmentItem[]): number {
  return segments.reduce((total, segment) => total + getDistanceMeters(segment), 0);
}

export function getTotalSegmentCount(segments: WorkoutSegmentItem[]): number {
  return segments.reduce((total, segment) => {
    if (segment.type === 'group') {
      return total + segment.segments.length * segment.repeatCount;
    }
    return total + 1;
  }, 0);
}

export function getTotalDurationSeconds(segments: WorkoutSegmentItem[]): number {
  return segments.reduce((total, segment) => total + getDurationSeconds(segment), 0);
}

// Weight is duration for run/bike workouts, distance for swim workouts
export function getTotalWeight(segments: WorkoutSegmentItem[]): number {
  return segments.reduce((total, segment) => total + getWeight(segment), 0);
}

export function flattenSegmentItems(segments: WorkoutSegmentItem[]): WorkoutIndividualItem[] {
  return segments.flatMap((segment) => {
    if (segment.type === 'group') {
      const flattened = flattenSegmentItems(segment.segments);
      return Array.from({ length: segment.repeatCount }, () => flattened).flat();
    }
    return [segment];
  });
}
