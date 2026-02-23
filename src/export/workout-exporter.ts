import { WorkoutSegmentItem } from '../workouts/workout-types';

interface WorkoutExporter<T> {
  export(workoutSegments: WorkoutSegmentItem[]): Promise<T>;
}

export default WorkoutExporter;
