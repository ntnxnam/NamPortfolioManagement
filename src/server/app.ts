import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySecurityMiddleware } from '../middleware/security.js';
import { applyLogging } from '../middleware/logging.js';
import { registerHealthRoutes } from '../routes/health.js';
import { registerControlRoutes } from '../routes/control.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
	const app = express();
	applyLogging(app);
	applySecurityMiddleware(app);
	app.use(express.json({ limit: '1mb' }));
	app.use(express.urlencoded({ extended: false, limit: '1mb' }));

	const router = express.Router();
	registerHealthRoutes(router);
	registerControlRoutes(router);
	app.use('/api', router);

	// In development, disable caching to always serve the latest assets
	if (process.env.NODE_ENV === 'development') {
		app.use((_req, res, next) => {
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			next();
		});
	}

	const staticOptions = process.env.NODE_ENV === 'development'
		? { etag: false, lastModified: false, cacheControl: false, immutable: false, maxAge: 0 }
		: {};
	app.use(express.static(path.join(__dirname, '../../public'), staticOptions as any));
	app.use((_req, res) => {
		res.sendFile(path.join(__dirname, '../../public/index.html'));
	});

	return app;
}
