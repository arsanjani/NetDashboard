import { getMonitors, addSample, getSamplesForMonitor, getCountForMonitor } from '../db.js';
import { pingHost } from './ping.js';

export interface PollerMetrics {
  id: number;
  hostname: string;
  label: string;
  enabled: boolean;
  avgPing: number | null;
  jitter: number | null;
  packetLoss: number;
  samples: Array<{ timestamp: number; latency: number }>;
  statusColor: 'green' | 'yellow' | 'red';
  grade: 'A' | 'B' | 'C';
}

let polling = false;
let stopped = false;
let paused = false;
let emitFn: ((data: unknown) => void) | null = null;

export async function startPolling(emit: (data: unknown) => void): Promise<void> {
  if (polling || stopped) return;
  polling = true;
  emitFn = emit;

  while (!stopped) {
    if (!paused) {
      try {
        await pollOnce();
      } catch (e) {
        console.error('Poll error:', e);
      }
    }
    await sleep(1000);
  }
}

export function stopPolling(): void {
  stopped = true;
  polling = false;
  emitFn = null;
}

export function setPaused(value: boolean): void {
  paused = value;
}

export function isPaused(): boolean {
  return paused;
}

async function pollOnce(): Promise<void> {
  const monitors = getMonitors();
  if (!monitors.length) return;

  for (const monitor of monitors) {
    if (!monitor.enabled) continue;
    try {
      const result = await pingHost(monitor.hostname);
      addSample(monitor.id, result.latency, result.lost);
    } catch {
      addSample(monitor.id, null, true);
    }
  }

  const metrics = calcAllMetrics();
  if (emitFn) emitFn({ type: 'metrics', data: metrics });
}

function calcAllMetrics(): PollerMetrics[] {
  const monitors = getMonitors();

  return monitors.map((m) => {
    const samples = getSamplesForMonitor(m.id, 240);
    const counts = getCountForMonitor(m.id);

    if (!samples.length) {
      return {
        id: m.id, hostname: m.hostname, label: m.label, enabled: m.enabled,
        avgPing: null, jitter: null, packetLoss: 0, samples: [],
        statusColor: 'green' as const, grade: 'A' as const,
      };
    }

    const latencies = samples.map((s) => s.latency);
    const avgPing = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    let jitterSum = 0;
    for (let i = 1; i < latencies.length; i++) {
      jitterSum += Math.abs(latencies[i] - latencies[i - 1]);
    }
    const jitter = latencies.length > 1 ? jitterSum / (latencies.length - 1) : 0;

    const packetLoss = counts.total ? (counts.lost / counts.total) * 100 : 0;

    const chartPoints = samples.map((s, i) => ({
      timestamp: Date.parse(s.timestamp),
      latency: s.latency,
    }));

    let statusColor: 'green' | 'yellow' | 'red' = 'green';
    if (avgPing > 60 || packetLoss > 5) statusColor = 'red';
    else if (avgPing > 50 || packetLoss > 1) statusColor = 'yellow';

    let grade: 'A' | 'B' | 'C' = 'A';
    if (avgPing <= 30 && packetLoss < 1) grade = 'A';
    else if (avgPing <= 60 && packetLoss < 5) grade = 'B';
    else grade = 'C';

    return {
      id: m.id, hostname: m.hostname, label: m.label, enabled: m.enabled,
      avgPing: Math.round(avgPing * 100) / 100,
      jitter: Math.round(jitter * 100) / 100,
      packetLoss: Math.round(packetLoss * 100) / 100,
      samples: chartPoints, statusColor, grade,
    };
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
