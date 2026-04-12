import { z } from 'zod';

export const SwimStrokeSchema = z.enum(['free', 'kick', 'drill', 'choice']);
export type SwimStroke = z.infer<typeof SwimStrokeSchema>;
