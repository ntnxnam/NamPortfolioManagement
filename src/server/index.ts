import http from 'node:http';
import stoppable from 'stoppable';
import { createApp } from './app.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const app = createApp();
const rawServer = http.createServer(app);
const server = stoppable(rawServer, 10_000);

if (env.TRUST_PROXY) {
	app.set('trust proxy', true);
}

const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

function closeServerGracefully(signal: NodeJS.Signals) {
	logger.info({ signal }, 'Received shutdown signal');
	server.stop((err?: Error) => {
		if (err) {
			logger.error({ err }, 'Error during server stop');
			process.exitCode = 1;
		}
		logger.info('HTTP server closed');
		process.exit();
	});
}

for (const signal of signals) {
	process.on(signal, () => closeServerGracefully(signal));
}

server.listen(env.PORT, env.HOST, () => {
	logger.info({ port: env.PORT, host: env.HOST, pid: process.pid }, 'Server lis
tening');
});
