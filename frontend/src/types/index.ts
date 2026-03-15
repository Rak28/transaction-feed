export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  status: 'approved' | 'pending' | 'declined';
  partition: number;
  offset: number;
  latency_ms: number;
  timestamp: string;
  user_id: string;
  card_last4: string;
}

export interface Stats {
  type: 'stats';
  message_count: number;
  total_volume: number;
  avg_latency_ms: number;
  max_latency_ms: number;
  active_connections: number;
  partitions: number;
  timestamp: string;
}

export type WSMessage =
  | { type: 'transaction'; data: Transaction }
  | { type: 'history'; data: Transaction[] }
  | Stats;
