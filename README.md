# NetDashboard

A real-time network monitoring dashboard that tracks connectivity, latency, jitter, and packet loss for multiple hosts simultaneously.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

## Features

- **Real-time Monitoring** — Live connectivity checks every second via WebSocket
- **Latency Tracking** — TCP-based ping on ports 80, 443, and 53 with up to 4 minutes of historical chart data
- **Performance Metrics** — Average ping, jitter, packet loss, status indicator, and health grade (A/B/C)
- **Host Management** — Add, remove, enable/disable, and reorder monitors from the UI
- **Pausing** — Pause and resume polling without losing configuration
- **Auto-seeding** — Ships with Cloudflare DNS, Google DNS, Google, and Cloudflare as default monitors

## Tech Stack

| Layer    | Technologies                              |
| -------- | ----------------------------------------- |
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Recharts |
| Backend  | Node.js, Express, WebSocket (`ws`)        |
| Storage  | JSON file-based persistence               |

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Quick Start

```bash
# Clone the repository
git clone https://github.com/arsanjani/NetDashboard.git
cd NetDashboard

# Install all dependencies (server + client)
npm install

# Start both server and client in development mode
npm run dev
```

On Windows, you can also double-click `start.bat` to launch the application.

The frontend will be available at **http://localhost:5173** and the backend API at **http://localhost:3001**.

## Project Structure

```
NetDashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (MonitorCard, Sidebar, TopNav)
│   │   └── App.tsx         # Main application component
│   └── vite.config.ts
├── server/
│   └── src/
│       ├── index.ts        # Express server + WebSocket handler
│       ├── db.ts           # JSON-based data persistence layer
│       └── services/
│           ├── ping.ts     # TCP connectivity checker
│           └── poller.ts   # Polling engine & metrics calculator
├── data/                   # Persisted data (auto-created)
│   ├── monitors.json       # Monitor configuration
│   └── samples.json        # Ping sample history (git-ignored)
└── package.json            # Root workspace configuration
```

## How It Works

1. The **poller** runs every second, iterating over all enabled monitors
2. For each monitor, it attempts a TCP connection on ports 80 → 443 → 53 (first success wins)
3. Results are stored as samples and aggregated into metrics (avg ping, jitter, packet loss)
4. Metrics are broadcast via **WebSocket** to all connected clients in real-time
5. The frontend renders live-updating cards and charts for each monitored host

### Health Grades & Status Colors

Grades are derived from status color, so they always stay in sync:

| Status  | Grade | Condition                              |
| ------- | ----- | -------------------------------------- |
| Green   | A     | avgPing ≤ 50ms and loss ≤ 1%           |
| Yellow  | B     | avgPing 51–100ms or loss 1–5%          |
| Red     | C     | avgPing > 100ms or loss > 5%           |

The card theme color (dot, chart line, and grade badge) always matches the current status.

## Configuration

Set the server port via environment variable:

```bash
PORT=3001 npm run dev
```

## Scripts

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm install`        | Install dependencies for all workspaces |
| `npm run dev`        | Start server + client in dev mode     |
| `npm run build`      | Build both server and client          |

## License

MIT