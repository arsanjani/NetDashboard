import { getMonitors, addMonitor, removeMonitor, toggleMonitor, reorderMonitors } from '../db.js';

export interface MonitorEntry {
  id: number;
  hostname: string;
  label: string;
  enabled: boolean;
  order_index: number;
}

export async function loadMonitors(): Promise<MonitorEntry[]> {
  return getMonitors();
}

export async function doAddMonitor(hostname: string, label?: string): Promise<number> {
  return addMonitor(hostname, label);
}

export async function doRemoveMonitor(id: number): Promise<void> {
  removeMonitor(id);
}

export async function doToggleMonitor(id: number, enabled: boolean): Promise<void> {
  toggleMonitor(id, enabled);
}

export async function doReorderMonitors(order: Array<{ id: number; order_index: number }>): Promise<void> {
  reorderMonitors(order);
}
