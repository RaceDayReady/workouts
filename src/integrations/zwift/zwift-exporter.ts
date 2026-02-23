import WorkoutExporter from '../../export/workout-exporter';

export class ZwiftExporter implements WorkoutExporter<ZwiftWorkout> {
  private readonly options: ZwiftExportOptions;

  constructor(options: ZwiftExportOptions) {
    this.options = options;
  }

  async export(workoutSegments: WorkoutSegmentItem[]): Promise<ZwiftWorkout> {
    return exportWorkoutToZwift(workoutSegments, this.options);
  }
}
