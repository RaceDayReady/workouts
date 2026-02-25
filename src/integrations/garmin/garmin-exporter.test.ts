import { describe, expect, it } from 'vitest';
import { GarminExporter } from './garmin-exporter';
import { type WorkoutSegmentItem } from '../../workouts/workout-types';

describe('GarminExporter', () => {
  it('uses DISTANCE for swim steps and maps swim stroke', async () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'individual',
        id: 'swim-1',
        name: 'Swim Main',
        discipline: 'swim',
        zone: 2,
        toZone: 3,
        stroke: 'free',
        target_distance_meters: 400,
        target_duration_seconds: 600,
      },
    ];

    const exporter = new GarminExporter({
      workoutName: 'Swim',
      sport: 'LAP_SWIMMING',
    });

    const result = await exporter.export(workoutSegments);
    const step = result.segments?.[0]?.steps?.[0];

    expect(step).toMatchObject({
      type: 'WorkoutStep',
      durationType: 'DISTANCE',
      durationValue: 400,
      strokeType: 'FREESTYLE',
      targetValueLow: 2,
      targetValueHigh: 3,
    });
  });

  it('uses TIME for run steps even when distance exists', async () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'individual',
        id: 'run-1',
        name: 'Run Interval',
        discipline: 'run',
        zone: 4,
        target_duration_seconds: 300,
        target_distance_meters: 1000,
      },
    ];

    const exporter = new GarminExporter({
      workoutName: 'Run',
      sport: 'RUNNING',
    });

    const result = await exporter.export(workoutSegments);
    const step = result.segments?.[0]?.steps?.[0];

    expect(step).toMatchObject({
      type: 'WorkoutStep',
      durationType: 'TIME',
      durationValue: 300,
    });
  });

  it('uses TIME for bike steps', async () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'individual',
        id: 'bike-1',
        name: 'Bike Tempo',
        discipline: 'bike',
        zone: 3,
        target_duration_seconds: 1200,
      },
    ];

    const exporter = new GarminExporter({
      workoutName: 'Bike',
      sport: 'CYCLING',
    });

    const result = await exporter.export(workoutSegments);
    const step = result.segments?.[0]?.steps?.[0];

    expect(step).toMatchObject({
      type: 'WorkoutStep',
      durationType: 'TIME',
      durationValue: 1200,
    });
  });

  it('keeps group workouts as repeat steps and preserves unique step order', async () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'individual',
        id: 'warmup',
        name: 'Warmup',
        discipline: 'swim',
        zone: 1,
        target_distance_meters: 200,
      },
      {
        type: 'group',
        id: 'main-1',
        name: 'Main Set',
        repeatCount: 3,
        segments: [
          {
            type: 'individual',
            id: 'main-1-rep',
            name: '100 Free',
            discipline: 'swim',
            zone: 2,
            target_distance_meters: 100,
          },
        ],
      },
      {
        type: 'individual',
        id: 'cooldown',
        name: 'Cooldown',
        discipline: 'swim',
        zone: 1,
        target_distance_meters: 100,
      },
    ];

    const exporter = new GarminExporter({
      workoutName: 'Swim Repeats',
      sport: 'LAP_SWIMMING',
    });

    const result = await exporter.export(workoutSegments);
    const steps = result.segments?.[0]?.steps ?? [];

    expect(steps).toHaveLength(3);
    expect(steps.filter((step) => step.type === 'WorkoutRepeatStep')).toHaveLength(1);

    const allStepOrders: number[] = [];
    for (const step of steps) {
      if (typeof step.stepOrder === 'number') {
        allStepOrders.push(step.stepOrder);
      }
      if (step.type === 'WorkoutRepeatStep') {
        for (const nestedStep of step.steps) {
          if (typeof nestedStep.stepOrder === 'number') {
            allStepOrders.push(nestedStep.stepOrder);
          }
        }
      }
    }

    expect(allStepOrders.length).toBe(new Set(allStepOrders).size);
  });
});
