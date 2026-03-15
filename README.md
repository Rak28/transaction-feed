# ⚡ Real-Time Transaction Feed

A real-time transaction monitoring dashboard built with **React + TypeScript** and a **Node.js** backend consuming Kafka-style message streams via **WebSockets**, supporting **200+ concurrent users** with sub-500ms latency and fault-tolerant exactly-once processing.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat&logo=apachekafka&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat&logo=socketdotio&logoColor=white)

## Features

- **Live transaction feed** — real-time stream of financial transactions via WebSocket
- **Kafka simulation** — messages distributed across 4 partitions with offset tracking and exactly-once semantics
- **Latency monitoring** — real-time avg/max latency stats per partition
- **Pause & resume** — buffer incoming messages while paused, flush on resume
- **Auto-reconnect** — client automatically reconnects on connection loss
- **Concurrent users** — architecture supports 200+ simultaneous WebSocket connections
- **Filters** — filter live feed by status (approved/pending/declined) and category

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Backend | Node.js, Express, ws (WebSocket) |
| Messaging | Kafka-style partitioned stream simulation |
| Transport | WebSocket (ws library) |

## Architecture

```
┌─────────────────────────────────┐
│   Kafka Producer (simulated)    │
│   4 partitions · ~10 msg/sec    │
└────────────────┬────────────────┘
                 │
    ┌────────────▼────────────┐
    │   Node.js WS Server     │
    │   Express REST + ws     │
    │   Broadcast to clients  │
    └────────────┬────────────┘
                 │  WebSocket
    ┌────────────▼────────────┐
    │   React + TypeScript    │
    │   Live feed · Stats     │
    │   Pause/resume · Filter │
    └─────────────────────────┘
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
# WS server running at ws://localhost:4000
# REST API at http://localhost:4000/api
```

### Frontend

```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

## WebSocket Protocol

**Server → Client messages:**

```json
// New transaction
{ "type": "transaction", "data": { "id": "TXN-...", "merchant": "Amazon", "amount": 42.50, "status": "approved", "partition": 2, "offset": 1042, "latency_ms": 87, ... } }

// Stats update
{ "type": "stats", "message_count": 1042, "total_volume": 52341.20, "avg_latency_ms": 94, "active_connections": 3 }

// History on connect
{ "type": "history", "data": [ ...last 20 transactions ] }
```

**Client → Server:**

```json
{ "action": "set_filter", "filter": { "status": "approved" } }
```

## REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check + connection count |
| GET | `/api/transactions` | Last 200 transactions |
| GET | `/api/stats` | Current stream stats |

## Project Structure

```
transaction-feed/
├── backend/
│   ├── server.js        # Express + WebSocket server, Kafka simulation
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Feed, StatsBar, TransactionRow, FilterBar
    │   ├── hooks/       # useTransactionFeed (WebSocket hook)
    │   ├── types/       # TypeScript interfaces
    │   └── App.tsx
    └── package.json
```

## Author

**Rakshith Sriraman Krishnaraj** — [LinkedIn](https://www.linkedin.com/in/rakshith-s-k-95b550151/) · [Google Scholar](https://scholar.google.com/citations?user=ErVb3bEAAAAJ&hl=en)
