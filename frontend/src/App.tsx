import React, { useState } from 'react';
import { useTransactionFeed } from './hooks/useTransactionFeed';
import { Transaction } from './types';
import './App.css';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const STATUS_COLORS: Record<string, string> = {
  approved: '#22c55e', pending: '#f59e0b', declined: '#ef4444'
};

function TransactionRow({ tx }: { tx: Transaction }) {
  return (
    <div className="tx-row">
      <div className="tx-left">
        <div className="tx-merchant">{tx.merchant}</div>
        <div className="tx-meta">{tx.category} · P{tx.partition} · offset {tx.offset} · ····{tx.card_last4}</div>
      </div>
      <div className="tx-middle">
        <span className="tx-latency">{tx.latency_ms}ms</span>
        <span className="tx-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="tx-right">
        <div className="tx-amount">{fmt(tx.amount)}</div>
        <div className="tx-status" style={{ color: STATUS_COLORS[tx.status] }}>{tx.status}</div>
      </div>
    </div>
  );
}

export default function App() {
  const { transactions, stats, connected, paused, togglePause } = useTransactionFeed();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.status === filter);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">⚡</span>
          <div>
            <h1>Transaction Feed</h1>
            <p className="subtitle">Real-time Kafka stream · 4 partitions</p>
          </div>
        </div>
        <div className="header-right">
          <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">{connected ? 'Live' : 'Reconnecting...'}</span>
          <button className={`btn-pause ${paused ? 'paused' : ''}`} onClick={togglePause}>
            {paused ? `▶ Resume${transactions.length ? '' : ''}` : '⏸ Pause'}
          </button>
        </div>
      </header>

      {stats && (
        <div className="stats-bar">
          <div className="stat"><div className="stat-label">Messages</div><div className="stat-value">{stats.message_count.toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Total Volume</div><div className="stat-value">{fmt(stats.total_volume)}</div></div>
          <div className="stat"><div className="stat-label">Avg Latency</div><div className="stat-value">{stats.avg_latency_ms}ms</div></div>
          <div className="stat"><div className="stat-label">Max Latency</div><div className="stat-value">{stats.max_latency_ms}ms</div></div>
          <div className="stat"><div className="stat-label">Connections</div><div className="stat-value">{stats.active_connections}</div></div>
          <div className="stat"><div className="stat-label">Partitions</div><div className="stat-value">{stats.partitions}</div></div>
        </div>
      )}

      <div className="feed-controls">
        <div className="filter-pills">
          {['all', 'approved', 'pending', 'declined'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <span className="tx-count">{filtered.length} transactions</span>
        {paused && <span className="paused-badge">⏸ PAUSED</span>}
      </div>

      <div className="feed">
        {filtered.length === 0 && (
          <div className="empty">Waiting for transactions...</div>
        )}
        {filtered.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}
