import { MonitorMetric } from '../hooks/useDashboard';
import { MonitorCard } from './MonitorCard';

interface Props {
  metrics: MonitorMetric[];
}

export function MonitoringGrid({ metrics }: Props) {
  if (!metrics.length) {
    return (
      <div className="text-gray-500">
        <p className="text-center py-20 text-sm">No monitors configured. Add a target to begin monitoring.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((m) => (
        <MonitorCard key={m.id} metric={m} />
      ))}
    </div>
  );
}
