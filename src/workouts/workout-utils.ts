import type { WorkoutIndividualItem, WorkoutSegmentItem } from './workout-types';

export const generateWorkoutItemId = () => Math.random().toString(36).substring(2, 9);

export function getTotalDistanceMeters(segments: WorkoutSegmentItem[]): number {
  return segments.reduce((total, segment) => {
    if (segment.type === 'group') {
      const groupDistance = segment.segments.reduce((sum: number, item: WorkoutIndividualItem) => {
        return sum + ('target_distance_meters' in item ? (item.target_distance_meters ?? 0) : 0);
      }, 0);
      return total + groupDistance * segment.repeatCount;
    }
    return (
      total + ('target_distance_meters' in segment ? (segment.target_distance_meters ?? 0) : 0)
    );
  }, 0);
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
  return segments.reduce((total, segment) => {
    if (segment.type === 'group') {
      const groupDuration = segment.segments.reduce((sum: number, item: WorkoutIndividualItem) => {
        return sum + (item.target_duration_seconds ?? 0);
      }, 0);
      return total + groupDuration * segment.repeatCount;
    }
    return total + (segment.target_duration_seconds ?? 0);
  }, 0);
}
