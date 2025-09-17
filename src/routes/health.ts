import type { Router } from 'express';

export function registerHealthRoutes(router: Router) {
	router.get('/health', (_req, res) => {
		res.status(200).json({ status: 'ok', uptime: process.uptime() });
	});
}
