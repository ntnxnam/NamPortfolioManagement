import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySecurityMiddleware } from '../middleware/security.js';
import { applyLogging } from '../middleware/logging.js';
import { registerHealthRoutes } from '../routes/health.js';

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
	app.use('/api', router);

	app.use(express.static(path.join(__dirname, '../../public')));
	app.get('*', (_req, res) => {
		res.sendFile(path.join(__dirname, '../../public/index.html'));
	});

	return app;
}
