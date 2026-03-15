import { useEffect, useRef, useState, useCallback } from 'react';
import { Transaction, Stats, WSMessage } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';
const MAX_TRANSACTIONS = 200;

export function useTransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pausedRef = useRef(false);
  const bufferRef = useRef<Transaction[]>([]);
  pausedRef.current = paused;

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connect, 2000); };
    ws.onmessage = (e) => {
      const msg: WSMessage = JSON.parse(e.data);
      if (msg.type === 'stats') { setStats(msg); }
      else if (msg.type === 'history') { setTransactions(msg.data); }
      else if (msg.type === 'transaction') {
        if (pausedRef.current) { bufferRef.current.push(msg.data); }
        else { setTransactions(prev => [msg.data, ...prev].slice(0, MAX_TRANSACTIONS)); }
      }
    };
    return ws;
  }, []);

  useEffect(() => { const ws = connect(); return () => ws.close(); }, [connect]);

  const togglePause = () => {
    if (paused) { setTransactions(prev => [...bufferRef.current, ...prev].slice(0, MAX_TRANSACTIONS)); bufferRef.current = []; }
    setPaused(p => !p);
  };

  return { transactions, stats, connected, paused, togglePause };
}