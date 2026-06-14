import { useState } from 'react';

interface Props {
  monitors: Array<{ id: number; hostname: string; label: string; enabled: boolean; order_index?: number }>;
  metrics: Array<{ id: number; avgPing: number | null; statusColor: 'green' | 'yellow' | 'red' }>;
  onAdd: (hostname: string, label?: string) => void;
  onRemove: (id: number) => void;
  onReorder?: (order: Array<{ id: number; order_index: number }>) => void;
  collapsed: boolean;
  paused: boolean;
  onTogglePause: () => void;
}

export function Sidebar({ monitors, metrics, onAdd, onRemove, onReorder, collapsed, paused, onTogglePause }: Props) {
  const [input, setInput] = useState('');
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const sortedMonitors = [...monitors].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const handleDragStart = (index: number) => {
    setDragFrom(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragFrom === null || dragFrom === index) return;
    const newMonitors = [...sortedMonitors];
    const [moved] = newMonitors.splice(dragFrom, 1);
    newMonitors.splice(index, 0, moved);
    setDragFrom(index);
    // Live-update: send reordered indices immediately
    const reordered = newMonitors.map((m, i) => ({ id: m.id, order_index: i }));
    onReorder?.(reordered);
  };

  const handleDrop = () => {
    setDragFrom(null);
  };

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div className={`${collapsed ? 'w-0' : 'w-[260px]'} flex-shrink-0 overflow-hidden transition-all duration-300 ${'glass-card border-r'}`}>
      <div className="flex h-full flex-col p-4">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight">NetDashboard</h1>
          <p className="mt-1 text-xs tracking-tight text-gray-400">Internet, in intensive care</p>
        </div>

        <button
          onClick={onTogglePause}
          className={`mb-4 w-full rounded-lg px-3 py-2 text-xs font-medium transition-all ${paused ? 'border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
        >
          {paused ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5v7l5.5-3.5z" /></svg>
              Resume
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1" width="2.5" height="8" rx="0.5" /><rect x="6" y="1" width="2.5" height="8" rx="0.5" /></svg>
              Pause
            </span>
          )}
        </button>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Monitors</span>
          <span className="text-[10px] text-gray-600">{monitors.length}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="mb-3 flex items-center gap-2 rounded-[14px] bg-white/5 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <span className="text-sm">+</span> Add target
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="hostname or URL"
          className="mb-6 rounded-[14px] bg-[#18181b] border border-white/5 px-3 py-2 text-xs outline-none transition-colors focus:border-blue-500/40 placeholder:text-gray-600"
        />

        <div className="flex-1 overflow-y-auto">
          {sortedMonitors.map((m, index) => {
            const metric = metrics.find((mt) => mt.id === m.id);
            return (
              <MonitorRow
                key={m.id}
                monitor={m}
                ping={metric?.avgPing ?? null}
                statusColor={metric?.statusColor}
                onRemove={onRemove}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  monitor: { id: number; label: string; enabled: boolean };
  ping: number | null;
  statusColor?: 'green' | 'yellow' | 'red';
  onRemove: (id: number) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}

function MonitorRow({ monitor, ping, statusColor, onRemove, onDragStart, onDragOver, onDrop }: RowProps) {
  const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' } as const;
  const dotColor = monitor.enabled ? (colorMap[statusColor ?? 'green'] ?? '#6b7280') : '#6b7280';

  return (
    <div
      className="group mb-1 flex items-center justify-between rounded-[14px] px-3 py-2 transition-colors hover:bg-white/5 cursor-grab active:cursor-grabbing"
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-3">
        <span style={{ backgroundColor: dotColor }} className="h-2 w-2 rounded-full flex-shrink-0"></span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium truncate">{monitor.label}</span>
          {ping !== null && (
            <span className="text-[10px] text-gray-500">{ping.toFixed(1)} ms</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(monitor.id)}
        className="rounded p-0.5 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 3l6 6M9 3l-6 6" stroke="#a8a8a8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
