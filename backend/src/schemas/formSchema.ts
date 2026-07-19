import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

export const sampleFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  fields: z.array(z.unknown()),
});
