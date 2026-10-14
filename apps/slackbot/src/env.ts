import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().default('SlackBot'),
  VITE_APP_PORT: z.coerce.number().default(1421),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(import.meta.env);
