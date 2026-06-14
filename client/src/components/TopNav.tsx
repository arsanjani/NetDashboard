interface Props {
  onToggleSidebar: () => void;
}

export function TopNav({ onToggleSidebar }: Props) {
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
    </div>
  );
}
