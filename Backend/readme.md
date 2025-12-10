# Task Tracker Backend

The backend service for the Task Tracker application, built with Node.js, Express, TypeScript, and Redis Stack. It provides a REST API for task management and a real-time WebSocket layer for collaborative updates.

## 🛠 Tech Stack

* **Runtime:** Node.js (v20)
* **Framework:** Express.js
* **Language:** TypeScript (ESM)
* **Database:** Redis Stack (RedisJSON, RediSearch, Redis Streams)
* **Real-time:** Socket.IO
* **Validation:** Zod (planned/partial)
* **Containerization:** Docker

## 🚀 Getting Started

### Prerequisites

* Docker & Docker Compose (Recommended)
* Node.js v20+ (If running locally)
* Redis Stack instance (If running locally)

### 1. Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=4000
NODE_ENV=development
# Redis URL (use 'redis' hostname for Docker, 'localhost' for local dev)
REDIS_URL=redis://redis:6379
JWT_SECRET=your_super_secret_key