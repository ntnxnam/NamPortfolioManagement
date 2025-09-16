import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
	level: env.LOG_LEVEL,
	transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefi
ned,
	base: { env: env.NODE_ENV },
});
