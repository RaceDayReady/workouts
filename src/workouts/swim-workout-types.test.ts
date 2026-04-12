import { describe, expect, it } from 'vitest';
import { SwimStrokeSchema } from './swim-workout-types';

describe('SwimStrokeSchema', () => {
  it('accepts valid strokes', () => {
    expect(SwimStrokeSchema.safeParse('free').success).toBe(true);
    expect(SwimStrokeSchema.safeParse('kick').success).toBe(true);
    expect(SwimStrokeSchema.safeParse('drill').success).toBe(true);
    expect(SwimStrokeSchema.safeParse('choice').success).toBe(true);
  });

  it('rejects invalid strokes', () => {
    expect(SwimStrokeSchema.safeParse('butterfly').success).toBe(false);
    expect(SwimStrokeSchema.safeParse('').success).toBe(false);
  });
});
