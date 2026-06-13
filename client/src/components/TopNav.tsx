interface Props {
  paused: boolean;
  onTogglePause: () => void;
  onToggleSidebar: () => void;
  onAddMonitor?: () => void;
}

export function TopNav({ paused, onTogglePause, onToggleSidebar, onAddMonitor }: Props) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white" title="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 7h18M3 12h10M3 17h18m-6 0h6" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${paused ? 'border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
          title={paused ? 'Resume monitoring' : 'Pause monitoring'}
        >
          {paused ? (
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5v7l5.5-3.5z" /></svg>
              Resume
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1" width="2.5" height="8" rx="0.5" /><rect x="6" y="1" width="2.5" height="8" rx="0.5" /></svg>
              Pause
            </span>
          )}
        </button>

        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white" title="Split panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="18" rx="1.5" />
            <rect x="14" y="3" width="7" height="18" rx="1.5" />
          </svg>
        </button>

        <button onClick={onAddMonitor} className="rounded-lg bg-white text-gray-900 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-200" title="Add new monitor">
          + Add target
        </button>
      </div>
    </div>
  );
}
