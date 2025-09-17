import pinoHttp from 'pino-http';
import type { Express } from 'express';
import { logger } from '../utils/logger.js';

export function applyLogging(app: Express) {
	app.use(pinoHttp({ logger }));
}
