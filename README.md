Mono Grid + Gantt (Monochrome)

Quick start

- Requirements: Node.js >= 18.18
- Install dependencies: npm install
- Start in development: npm run dev
- Open the app: http://localhost:3000
- Health check: http://localhost:3000/api/health
- Production build & run: npm start

What you get

- Spreadsheet-like grid: add rows, add columns, pick a type per column (text, number, date, boolean)
- Gantt chart: choose Start, End, and optional Next (creates a second segment from End → Next)
- Monochrome UI: black/white/grey palette for clarity
- Persistence: grid state is stored locally in your browser (localStorage)

Server ↔ Client architecture

- Server: Node + Express (TypeScript) serving static files from public/ and a small /api/health endpoint
  - Security: helmet, hpp, CORS, rate limiting, compression
  - Logging: pino with dev-friendly pretty output
  - Operations: graceful shutdown (SIGTERM/SIGINT), single port listen (HOST:PORT)
- Client: static HTML/CSS/JS (no heavy framework). All interactions are in-browser; no API calls except /api/health

Configuration

Create a .env if you need to override defaults (see .env.example):

- NODE_ENV: development | production
- PORT: default 3000
- HOST: default 0.0.0.0
- LOG_LEVEL: fatal | error | warn | info | debug | trace | silent
- CORS_ORIGIN: default * (not generally used since client is same-origin)
- TRUST_PROXY: true/false (enable if running behind a reverse proxy)

Docker

- Build: docker build -t mono-grid .
- Run: docker run --rm -p 3000:3000 mono-grid
- Open: http://localhost:3000

Notes on performance and safety

- Lightweight: serves static assets, minimal middleware, gzip/deflate compression
- Ports: only binds to the configured HOST:PORT
- GC: Node manages garbage collection; the server performs graceful shutdown and releases sockets cleanly
- No secrets are committed; use environment variables for configuration

# NamPortfolioManagement