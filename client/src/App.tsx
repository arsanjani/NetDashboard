import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HeaderBar } from './components/HeaderBar';
import { MonitoringGrid } from './components/MonitoringGrid';
import { useDashboard } from './hooks/useDashboard';

export default function App() {
  const { metrics, monitors, connected, send } = useDashboard();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paused, setPaused] = useState(false);

  const handleAddMonitor = (hostname: string, label?: string) => {
    send({ type: 'add_monitor', hostname, label });
  };

  const handleRemoveMonitor = (id: number) => {
    send({ type: 'remove_monitor', id });
  };

  const handleTogglePause = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    send({ type: nextPaused ? 'pause' : 'resume' });
  };

  const handleReorderMonitors = (order: Array<{ id: number; order_index: number }>) => {
    send({ type: 'reorder_monitors', order });
  };

  const globalAvgPing = metrics.length
    ? metrics.reduce((s, m) => s + (m.avgPing ?? 0), 0) / metrics.length
    : 0;

  const orderMap = Object.fromEntries(monitors.map(m => [m.id, m.order_index ?? 0]));
  const sortedMetrics = [...metrics].sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117] text-white">
      <Sidebar
        monitors={monitors}
        metrics={metrics}
        onAdd={handleAddMonitor}
        onRemove={handleRemoveMonitor}
        onReorder={handleReorderMonitors}
        collapsed={!sidebarOpen}
        paused={paused}
        onTogglePause={handleTogglePause}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <HeaderBar globalAvgPing={globalAvgPing} connected={connected} />
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {paused && (
            <div className="mb-3 rounded-[20px] border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400 backdrop-blur-sm">
              Monitoring paused. No new samples will be collected.
            </div>
          )}
          <MonitoringGrid metrics={sortedMetrics} />
        </div>
      </div>
    </div>
  );
}
