import { useState, useEffect } from 'react';

interface Props {
  globalAvgPing: number;
  connected: boolean;
}

export function HeaderBar({ globalAvgPing, connected }: Props) {
  const [publicIp, setPublicIp] = useState('...');
  const [localIp, setLocalIp] = useState('...');

  useEffect(() => {
    fetch('/api/ip')
      .then((r) => r.json())
      .then((d) => {
        setPublicIp(d.publicIp ?? 'unknown');
        setLocalIp(d.localIp ?? 'unknown');
      })
      .catch(() => {});
  }, []);

  const pingColor = globalAvgPing <= 50 ? '#22c55e' : globalAvgPing <= 60 ? '#eab308' : '#ef4444';
  const pingLabel = globalAvgPing <= 50 ? 'Healthy' : globalAvgPing <= 60 ? 'Degraded' : 'Critical';

  return (
    <div className="flex items-center gap-4 border-b border-white/[0.06] px-5 py-4">
      <div className="glass-card glass-card-hover rounded-[20px] px-4 py-3 flex-shrink-0 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Public IP</span>
        <div className="mt-1 text-sm font-medium">{publicIp}</div>
      </div>

      <div className="glass-card glass-card-hover rounded-[20px] px-4 py-3 flex-shrink-0 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Local IP</span>
        <div className="mt-1 text-sm font-medium">{localIp}</div>
      </div>

      <div className="glass-card glass-card-hover rounded-[20px] px-4 py-3 flex-shrink-0 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Global Avg</span>
        <div className="mt-1 flex items-center gap-3">
          <span style={{ color: pingColor }} className="font-mono text-sm font-bold">{globalAvgPing.toFixed(1)}</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: pingColor }}>
            {pingLabel}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1 backdrop-blur-sm bg-white/5 border border-white/[0.06]">
          <span style={{ backgroundColor: connected ? '#22c55e' : '#ef4444' }} className="h-[6px] w-[6px] rounded-full"></span>
          <span className="text-[10px] font-medium text-gray-400">{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}
