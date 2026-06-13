import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, '../../data');
const MONITORS_FILE = path.join(DATA_DIR, 'monitors.json');
const SAMPLES_FILE = path.join(DATA_DIR, 'samples.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

interface Monitor {
  id: number;
  hostname: string;
  label: string;
  enabled: boolean;
  order_index: number;
}

interface Sample {
  id: number;
  monitorId: number;
  latency: number | null;
  lost: boolean;
  timestamp: string;
}

let monitors: Monitor[] = [];
let samples: Sample[] = [];
let nextMonitorId = 1;
let nextSampleId = 1;

function saveMonitors(): void {
  fs.writeFileSync(MONITORS_FILE, JSON.stringify(monitors, null, 2));
}

function saveSamples(): void {
  fs.writeFileSync(SAMPLES_FILE, JSON.stringify(samples.slice(-600), null, 2));
}

function loadData(): void {
  try {
    if (fs.existsSync(MONITORS_FILE)) {
      monitors = JSON.parse(fs.readFileSync(MONITORS_FILE, 'utf-8')) as Monitor[];
      nextMonitorId = Math.max(...monitors.map((m) => m.id), 0) + 1;
    }
  } catch { /* ignore */ }

  try {
    if (fs.existsSync(SAMPLES_FILE)) {
      samples = JSON.parse(fs.readFileSync(SAMPLES_FILE, 'utf-8')) as Sample[];
      nextSampleId = Math.max(...samples.map((s) => s.id), 0) + 1;
    }
  } catch { /* ignore */ }

  if (!monitors.length) seedDefaults();
}

function seedDefaults(): void {
  const defaults = [
    { hostname: '1.1.1.1', label: 'Cloudflare DNS' },
    { hostname: '8.8.8.8', label: 'Google DNS' },
    { hostname: 'google.com', label: 'Google' },
    { hostname: 'cloudflare.com', label: 'Cloudflare' },
  ];
  monitors = defaults.map((d, i) => ({
    id: nextMonitorId++,
    hostname: d.hostname,
    label: d.label,
    enabled: true,
    order_index: i,
  }));
  saveMonitors();
}

loadData();

export function getMonitors(): Monitor[] {
  return [...monitors];
}

export function addMonitor(hostname: string, label?: string): number {
  const maxOrder = monitors.length ? Math.max(...monitors.map((m) => m.order_index)) : -1;
  const id = nextMonitorId++;
  monitors.push({
    id,
    hostname,
    label: label || hostname,
    enabled: true,
    order_index: maxOrder + 1,
  });
  saveMonitors();
  return id;
}

export function removeMonitor(id: number): void {
  monitors = monitors.filter((m) => m.id !== id);
  samples = samples.filter((s) => s.monitorId !== id);
  saveMonitors();
  saveSamples();
}

export function toggleMonitor(id: number, enabled: boolean): void {
  const m = monitors.find((mon) => mon.id === id);
  if (m) m.enabled = enabled;
  saveMonitors();
}

export function reorderMonitors(order: Array<{ id: number; order_index: number }>): void {
  for (const item of order) {
    const m = monitors.find((mon) => mon.id === item.id);
    if (m) m.order_index = item.order_index;
  }
  saveMonitors();
}

export function addSample(monitorId: number, latency: number | null, lost: boolean): void {
  samples.push({
    id: nextSampleId++,
    monitorId,
    latency,
    lost,
    timestamp: new Date().toISOString(),
  });
}

export function getSamplesForMonitor(monitorId: number, limit = 240): Array<{ timestamp: string; latency: number }> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  return samples
    .filter((s) => s.monitorId === monitorId && !s.lost && s.timestamp >= tenMinutesAgo)
    .slice(-limit)
    .map((s) => ({ timestamp: s.timestamp, latency: s.latency as number }));
}

export function getCountForMonitor(monitorId: number): { total: number; lost: number } {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const filtered = samples.filter((s) => s.monitorId === monitorId && s.timestamp >= tenMinutesAgo);
  return {
    total: filtered.length,
    lost: filtered.filter((s) => s.lost).length,
  };
}

export function cleanupSamples(): void {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  samples = samples.filter((s) => s.timestamp >= tenMinutesAgo);
}

setInterval(() => {
  cleanupSamples();
  saveSamples();
}, 60_000);
