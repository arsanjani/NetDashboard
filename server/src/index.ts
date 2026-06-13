import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { startPolling, setPaused } from './services/poller.js';
import { doAddMonitor, doRemoveMonitor, doToggleMonitor, doReorderMonitors } from './services/monitors.js';
import { getMonitors } from './db.js';

const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`WS client connected. Total: ${clients.size}`);
  broadcastTo(ws, { type: 'monitors', data: getMonitors() });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleWsMsg(msg);
    } catch {
      // ignore parse errors
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`WS client disconnected. Total: ${clients.size}`);
  });
});

function broadcast(data: unknown): void {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastTo(ws: WebSocket, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

async function handleWsMsg(msg: Record<string, unknown>): Promise<void> {
  switch (msg.type) {
    case 'add_monitor': {
      const hostname = String(msg.hostname ?? '');
      if (hostname.trim()) {
        await doAddMonitor(hostname.trim(), String(msg.label ?? ''));
        broadcast({ type: 'monitors', data: getMonitors() });
      }
      break;
    }
    case 'remove_monitor': {
      await doRemoveMonitor(Number(msg.id));
      broadcast({ type: 'monitors', data: getMonitors() });
      break;
    }
    case 'toggle_monitor': {
      await doToggleMonitor(Number(msg.id), Boolean(msg.enabled));
      break;
    }
    case 'reorder_monitors': {
      const order = (msg.order as Array<{ id: number; order_index: number }>) ?? [];
      await doReorderMonitors(order);
      broadcast({ type: 'monitors', data: getMonitors() });
      break;
    }
    case 'pause': {
      setPaused(true);
      broadcast({ type: 'paused', data: true });
      break;
    }
    case 'resume': {
      setPaused(false);
      broadcast({ type: 'paused', data: false });
      break;
    }
  }
}

app.get('/api/monitors', (_req, res) => {
  res.json(getMonitors());
});

app.get('/api/ip', async (_req, res) => {
  const os = await import('os');
  let localIp = 'unknown';
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp !== 'unknown') break;
  }
  try {
    const resp = await fetch('https://api.ipify.org?format=json');
    const data = await resp.json();
    res.json({ publicIp: data.ip, localIp });
  } catch {
    res.json({ publicIp: 'unknown', localIp });
  }
});

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPolling(broadcast).catch(console.error);
  broadcast({ type: 'monitors', data: getMonitors() });
});
