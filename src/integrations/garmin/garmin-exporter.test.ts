import { describe, expect, it } from 'vitest';
import { exportWorkoutToGarmin } from './garmin-exporter';
import {
  convertWorkoutIndividualItemDiscipline,
  convertWorkoutSegmentDiscipline,
  type WorkoutSegmentItem,
} from '../../workouts/workout-types';

describe('exportWorkoutToGarmin', () => {
  it('maps individual segments to Garmin workout steps', () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'individual',
        id: 'a1',
        name: 'Warmup',
        discipline: 'swim',
        target_duration_seconds: 600,
        zone: 2,
      },
      {
        type: 'individual',
        id: 'a2',
        name: 'Main Set',
        discipline: 'swim',
        target_duration_seconds: 300,
        target_distance_meters: 100,
        zone: 4,
        toZone: 5,
        stroke: 'free',
      },
    ];

    const result = exportWorkoutToGarmin(workoutSegments, {
      workoutName: 'Swim Session',
      sport: 'LAP_SWIMMING',
      description: 'Easy + threshold',
    });

    expect(result.workoutName).toBe('Swim Session');
    expect(result.sport).toBe('LAP_SWIMMING');
    expect(result.segments).toHaveLength(1);

    const [segment] = result.segments ?? [];
    expect(segment?.estimatedDurationInSecs).toBe(900);
    expect(segment?.estimatedDistanceInMeters).toBe(100);
    expect(segment?.steps).toHaveLength(2);

    const [warmup, mainSet] = segment?.steps ?? [];
    expect(warmup).toMatchObject({
      type: 'WorkoutStep',
      stepOrder: 1,
      durationType: 'TIME',
      durationValue: 600,
      targetValueLow: 2,
      targetValueHigh: 2,
    });

    expect(mainSet).toMatchObject({
      type: 'WorkoutStep',
      stepOrder: 2,
      durationType: 'DISTANCE',
      durationValue: 100,
      targetValueLow: 4,
      targetValueHigh: 5,
      strokeType: 'FREESTYLE',
    });
  });

  it('maps group segments to Garmin repeat steps with repeated estimate totals', () => {
    const workoutSegments: WorkoutSegmentItem[] = [
      {
        type: 'group',
        id: 'g1',
        name: 'Main Repeats',
        repeatCount: 3,
        segments: [
          {
            type: 'individual',
            id: 'g1s1',
            name: 'On',
            discipline: 'run',
            target_duration_seconds: 120,
            target_distance_meters: 50,
            zone: 5,
          },
          {
            type: 'individual',
            id: 'g1s2',
            name: 'Off',
            discipline: 'run',
            target_duration_seconds: 60,
            rest_seconds: 30,
            zone: 1,
          },
        ],
      },
    ];

    const result = exportWorkoutToGarmin(workoutSegments, {
      workoutName: 'Bike Intervals',
      sport: 'CYCLING',
    });

    const [segment] = result.segments ?? [];
    expect(segment?.estimatedDurationInSecs).toBe(630);
    expect(segment?.estimatedDistanceInMeters).toBe(150);
    expect(segment?.steps).toHaveLength(1);

    const [repeatStep] = segment?.steps ?? [];
    expect(repeatStep).toMatchObject({
      type: 'WorkoutRepeatStep',
      stepOrder: 1,
      repeatType: 'REPEAT_UNTIL_STEPS_CMPLT',
      repeatValue: 3,
    });

    if (repeatStep?.type === 'WorkoutRepeatStep') {
      expect(repeatStep.steps).toHaveLength(2);
      expect(repeatStep.steps[0]).toMatchObject({
        durationType: 'DISTANCE',
        durationValue: 50,
      });
      expect(repeatStep.steps[1]).toMatchObject({
        durationType: 'TIME',
        durationValue: 60,
        intensity: 'RECOVERY',
      });
    }
  });

  it('converts individual item discipline while preserving shared fields', () => {
    const input: WorkoutSegmentItem = {
      type: 'individual',
      id: 's1',
      name: 'Pull Set',
      discipline: 'swim',
      target_duration_seconds: 400,
      target_distance_meters: 200,
      zone: 3,
      stroke: 'free',
      rest_seconds: 15,
    };

    const converted = convertWorkoutIndividualItemDiscipline(input, 'bike');

    expect(converted).toMatchObject({
      type: 'individual',
      discipline: 'bike',
      id: 's1',
      name: 'Pull Set',
      target_duration_seconds: 400,
      zone: 3,
      rest_seconds: 15,
    });
  });

  it('converts group segment discipline recursively', () => {
    const group: WorkoutSegmentItem = {
      type: 'group',
      id: 'group-a',
      repeatCount: 2,
      segments: [
        {
          type: 'individual',
          id: 'a',
          name: 'Run Rep',
          discipline: 'run',
          target_duration_seconds: 180,
          target_distance_meters: 800,
          zone: 4,
        },
      ],
    };

    const converted = convertWorkoutSegmentDiscipline(group, 'swim');

    expect(converted.type).toBe('group');
    if (converted.type === 'group') {
      expect(converted.segments[0]).toMatchObject({
        type: 'individual',
        discipline: 'swim',
        id: 'a',
        name: 'Run Rep',
        target_duration_seconds: 180,
        target_distance_meters: 800,
      });
    }
  });
});
