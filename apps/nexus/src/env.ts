import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().default('Nexus'),
  VITE_APP_PORT: z.coerce.number().default(1420),
  VITE_ENABLE_VIBRANCY: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(import.meta.env);
