const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Mock Kafka-style message simulation ---
const MERCHANTS = ['Amazon', 'Starbucks', 'Uber', 'Netflix', 'Walmart', 'Apple', 'Spotify', 'DoorDash', 'Target', 'Airbnb', 'Lyft', 'GitHub', 'Stripe', 'Figma', 'Notion'];
const CATEGORIES = ['Shopping', 'Food & Drink', 'Transport', 'Entertainment', 'Subscription', 'Travel', 'Tech'];
const STATUSES = ['approved', 'approved', 'approved', 'approved', 'pending', 'declined'];
const PARTITIONS = [0, 1, 2, 3];

let messageCount = 0;
let totalVolume = 0;
const recentLatencies = [];
const transactionHistory = [];

function generateTransaction() {
  const amount = parseFloat((Math.random() * 450 + 1).toFixed(2));
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const partition = PARTITIONS[Math.floor(Math.random() * PARTITIONS.length)];
  const latency = Math.floor(Math.random() * 180 + 20);

  messageCount++;
  if (status === 'approved') totalVolume += amount;
  recentLatencies.push(latency);
  if (recentLatencies.length > 50) recentLatencies.shift();

  const tx = {
    id: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    status,
    partition,
    offset: messageCount,
    latency_ms: latency,
    timestamp: new Date().toISOString(),
    user_id: `user_${Math.floor(Math.random() * 200) + 1}`,
    card_last4: String(Math.floor(Math.random() * 9000) + 1000),
  };

  transactionHistory.unshift(tx);
  if (transactionHistory.length > 1000) transactionHistory.pop();
  return tx;
}

function getStats() {
  const avgLatency = recentLatencies.length > 0
    ? Math.round(recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length)
    : 0;
  const maxLatency = recentLatencies.length > 0 ? Math.max(...recentLatencies) : 0;

  return {
    type: 'stats',
    message_count: messageCount,
    total_volume: parseFloat(totalVolume.toFixed(2)),
    avg_latency_ms: avgLatency,
    max_latency_ms: maxLatency,
    active_connections: wss.clients.size,
    partitions: PARTITIONS.length,
    timestamp: new Date().toISOString(),
  };
}

// Broadcast to all connected clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// Simulate Kafka producing messages
let interval = null;
function startStream() {
  if (interval) return;
  interval = setInterval(() => {
    const tx = generateTransaction();
    broadcast({ type: 'transaction', data: tx });
    broadcast(getStats());
  }, 500); // ~2 msg/sec per connection, scales to simulate 10/sec
}

startStream();

wss.on('connection', (ws) => {
  console.log(`Client connected. Total: ${wss.clients.size}`);

  // Send last 20 transactions on connect
  ws.send(JSON.stringify({ type: 'history', data: transactionHistory.slice(0, 20) }));
  ws.send(JSON.stringify(getStats()));

  ws.on('message', (msg) => {
    try {
      const { action, filter } = JSON.parse(msg);
      if (action === 'set_filter') {
        ws.filter = filter; // store filter per client
      }
    } catch {}
  });

  ws.on('close', () => console.log(`Client disconnected. Total: ${wss.clients.size}`));
});

// REST endpoints
app.get('/api/health', (_, res) => res.json({ status: 'ok', connections: wss.clients.size }));
app.get('/api/transactions', (_, res) => res.json(transactionHistory.slice(0, 200)));
app.get('/api/stats', (_, res) => res.json(getStats()));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
