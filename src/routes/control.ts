import type { Router, Request, Response } from 'express';

export function registerControlRoutes(router: Router) {
	router.post('/power-off', (req: Request, res: Response) => {
		res.status(202).json({ status: 'shutting_down' });
		setTimeout(() => {
			// Hint GC if exposed
			try {
				// @ts-ignore
				if (typeof global.gc === 'function') {
					// @ts-ignore
					global.gc();
				}
			} catch {}
			process.kill(process.pid, 'SIGTERM');
		}, 50);
	});
}

