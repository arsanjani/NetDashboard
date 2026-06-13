import net from 'net';

interface PingResult {
  latency: number | null;
  lost: boolean;
}

const TIMEOUT_MS = 3000;
const PORTS = [80, 443, 53];

export async function pingHost(hostName: string): Promise<PingResult> {
  for (const port of PORTS) {
    const result = await tryPort(hostName, port);
    if (!result.lost) return result;
  }
  return { latency: null, lost: true };
}

function tryPort(host: string, port: number): Promise<PingResult> {
  return new Promise((resolve) => {
    const start = performance.now();
    const client = net.createConnection({ host, port }, () => {
      const latency = Math.round((performance.now() - start) * 100) / 100;
      client.destroy();
      resolve({ latency, lost: false });
    });
    client.on('error', () => { if (!client.destroyed) client.destroy(); resolve({ latency: null, lost: true }); });
    const timer = setTimeout(() => { if (!client.destroyed) client.destroy(); resolve({ latency: null, lost: true }); }, TIMEOUT_MS);
    client.on('close', () => clearTimeout(timer));
  });
}
