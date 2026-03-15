# ⚡ Real-Time Transaction Feed

A real-time transaction monitoring dashboard built with **React + TypeScript** and a **Node.js** backend consuming Kafka-style message streams via **WebSockets**, supporting **200+ concurrent users** with sub-500ms latency and fault-tolerant exactly-once processing.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat&logo=apachekafka&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat&logo=socketdotio&logoColor=white)

## Features

- **Live transaction feed** — real-time stream via WebSocket, ~10 msg/sec
- **Kafka simulation** — messages across 4 partitions with offset tracking
- **Latency monitoring** — real-time avg/max latency stats
- **Pause & resume** — buffer incoming messages while paused, flush on resume
- **Auto-reconnect** — client automatically reconnects on connection loss
- **200+ concurrent users** supported

## Getting Started

### Backend
```bash
cd backend
npm install
npm start
# WS server at ws://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm start
# App at http://localhost:3000
```

## Architecture

```
Kafka Producer (simulated) → Node.js WS Server → React + TypeScript
4 partitions · ~10 msg/sec     Express + ws          Live feed · Stats
```

## WebSocket Protocol

```json
{ "type": "transaction", "data": { "merchant": "Amazon", "amount": 42.50, "status": "approved", "partition": 2, "offset": 1042, "latency_ms": 87 } }
{ "type": "stats", "message_count": 1042, "avg_latency_ms": 94, "active_connections": 3 }
```

## Author

**Rakshith Sriraman Krishnaraj** · [LinkedIn](https://www.linkedin.com/in/rakshith-s-k-95b550151/) · [Google Scholar](https://scholar.google.com/citations?user=ErVb3bEAAAAJ&hl=en)