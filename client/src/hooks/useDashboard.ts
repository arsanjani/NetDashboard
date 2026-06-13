import { useState, useEffect, useRef, useCallback } from 'react';

interface WsMessage {
  type: string;
  data: unknown;
}

export interface MonitorMetric {
  id: number;
  hostname: string;
  label: string;
  enabled: boolean;
  avgPing: number | null;
  jitter: number | null;
  packetLoss: number;
  samples: { timestamp: number; latency: number }[];
  statusColor: 'green' | 'yellow' | 'red';
  grade: 'A' | 'B' | 'C';
}

export interface MonitorEntry {
  id: number;
  hostname: string;
  label: string;
  enabled: boolean;
  order_index?: number;
}

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;

export function useDashboard() {
  const [metrics, setMetrics] = useState<MonitorMetric[]>([]);
  const [monitors, setMonitors] = useState<MonitorEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          if (msg.type === 'metrics' && Array.isArray(msg.data)) {
            setMetrics(msg.data as MonitorMetric[]);
          }
          if (msg.type === 'monitors' && Array.isArray(msg.data)) {
            setMonitors(msg.data as MonitorEntry[]);
          }
        } catch { /* ignore */ }
      };
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
    };
  }, []);

  const send = useCallback((msg: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { metrics, monitors, connected, send };
}
