import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function applySecurityMiddleware(app: Express) {
	app.disable('x-powered-by');
	app.use(helmet());
	app.use(hpp());
	app.use(compression());
	app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: false }));

	const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false });
	app.use(limiter);
}
