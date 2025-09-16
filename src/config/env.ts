import dotenv from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const EnvSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
	HOST: z.string().default('0.0.0.0'),
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
	CORS_ORIGIN: z.string().default('*'),
	TRUST_PROXY: z.string().transform(v => v === 'true').optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	HOST: process.env.HOST,
	LOG_LEVEL: process.env.LOG_LEVEL,
	CORS_ORIGIN: process.env.CORS_ORIGIN,
	TRUST_PROXY: process.env.TRUST_PROXY,
});
