import { useMemo } from 'react';
import { MonitorMetric } from '../hooks/useDashboard';

interface Props {
  metric: MonitorMetric;
}

export const statusColorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
const colorTailwindMap = { green: 'bg-green-500/15 text-green-500', yellow: 'bg-yellow-500/15 text-yellow-500', red: 'bg-red-500/15 text-red-500' };

export function MonitorCard({ metric }: Props) {
  const lineColor = statusColorMap[metric.statusColor];

  const chartData = useMemo(() => {
    if (metric.samples.length < 2) return null;
    const samples = metric.samples.slice(-60);
    const w = 340;
    const h = 88;
    const leftPad = 28;
    const rightPad = 4;
    const topPad = 4;
    const bottomPad = 4;
    const chartW = w - leftPad - rightPad;
    const chartH = h - topPad - bottomPad;
    const latencies = samples.map((s) => s.latency);
    const maxLatency = Math.max(...latencies, 1);
    const minLatency = Math.min(...latencies, 0);
    const range = maxLatency - minLatency || 1;

    const points = samples.map((s, i) => {
      const x = leftPad + (i / (samples.length - 1)) * chartW;
      const y = topPad + chartH - ((s.latency - minLatency) / range) * chartH;
      return { x, y };
    });

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x},${points[i].y}`;
    }

    const areaD = `${d} L ${points[points.length - 1].x},${h - bottomPad} L ${points[0].x},${h - bottomPad} Z`;

    // Generate 4 Y-axis ticks
    const ticks = Array.from({ length: 4 }, (_, i) => {
      const val = minLatency + (range * i) / 3;
      const y = topPad + chartH - (i / 3) * chartH;
      return { label: val.toFixed(0), y };
    });

    return { linePath: d, areaPath: areaD, ticks, leftPad };
  }, [metric.samples]);

  return (
    <div className="glass-card glass-card-hover relative overflow-hidden rounded-[20px] p-5 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: lineColor, boxShadow: `0 0 8px ${lineColor}40` }}
            className="h-[8px] w-[8px] shrink-0 rounded-full"
          />
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{metric.label}</h3>
            <p className="mt-[2px] text-[11px] text-gray-500">{metric.hostname}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${colorTailwindMap[metric.statusColor] ?? colorTailwindMap.red}`}>
          {metric.grade}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <MetricPill label="Ping" value={metric.avgPing !== null ? `${metric.avgPing.toFixed(1)} ms` : '--'} color={lineColor} />
        <MetricPill label="Jitter" value={metric.jitter !== null ? `${metric.jitter.toFixed(1)}` : '--'} />
        <MetricPill label="Loss" value={`${metric.packetLoss.toFixed(2)} %`} />
      </div>

      <div className="overflow-hidden rounded-[16px] bg-[#0a0b10]/50">
        <svg viewBox="0 0 340 88" className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {chartData && (
            <>
              {chartData.ticks.map((t, i) => (
                <g key={i}>
                  <line x1={chartData.leftPad} y1={t.y} x2="336" y2={t.y} stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />
                  <text x="2" y={t.y + 3} fill="#71717a" fontSize="8" textAnchor="start">{t.label}</text>
                </g>
              ))}
              <path d={chartData.areaPath} fill={`url(#grad-${metric.id})`} />
              <path d={chartData.linePath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

function MetricPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-[14px] bg-white/[0.03] px-3 py-2.5 text-center">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">{label}</div>
      <div className="mt-1 text-xs font-bold" style={{ color: color ?? '#e5e7eb' }}>{value}</div>
    </div>
  );
}
