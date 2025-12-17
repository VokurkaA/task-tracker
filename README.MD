# Task Tracker

## Project Overview

Task Tracker is a full-stack collaborative task management application designed to facilitate real-time project
organization. The system allows users to create tasks, manage subtasks, and share lists with other users with specific
role-based permissions (Editor/Viewer).

The application is built with a focus on high performance and low latency, utilizing Redis Stack not just as a cache,
but as the primary database, search engine, and event streaming platform.

## Technologies

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** Redis Stack (RedisJSON, RediSearch, Redis Streams)
* **Real-time Communication:** Socket.IO, Redis Pub/Sub
* **Authentication:** JWT (JSON Web Tokens)

### Frontend

* **Framework:** React (Vite)
* **Styling:** TailwindCSS, HeroUI
* **State Management:** React Query (TanStack)
* **Language:** TypeScript

### DevOps & Infrastructure

* **Containerization:** Docker
* **Orchestration:** Docker Compose

## Redis Implementation

This project utilizes advanced features of Redis Stack to handle complex data requirements.

### 1. Primary Document Store (RedisJSON)

Instead of a traditional SQL or NoSQL database, the application stores task and user data directly in Redis using the
JSON module. This allows for atomic updates to specific fields without retrieving the entire object.

**Usage Example:**
When a user updates a task status, the backend performs an atomic merge operation:

```typescript
// Updates specific fields in the JSON document at key "task:{id}"
await redis.call('JSON.MERGE', taskId, '$', JSON.stringify({isCompleted: true}));
```

### 2. Full-Text Search and Indexing (RediSearch)

To enable efficient querying (e.g., finding all tasks owned by a specific user or shared with them), the system creates
secondary indexes on the JSON documents.

**Index Definition:**

* `idx:users`: Indexes users by email and username.
* `idx:tasks`: Indexes tasks by owner ID, priority, status, and shared user IDs.

**Usage Example:**
Retrieving tasks for a specific user uses the search capabilities:

```typescript
// Search query for tasks where the user is either the owner OR a shared participant
const query = `(@ownerId:{${userId}}) | (@sharedUserId:{${userId}})`;
await redis.call('FT.SEARCH', 'idx:tasks', query, 'LIMIT', '0', '100');
```

### 3. Event Streaming (Redis Streams)

User activities (creating tasks, completing items) are logged into an append-only log using Redis Streams. This provides
a reliable audit trail for system history.

**Usage Example:**

```typescript
// Appending a new event to the "stream:task_events" stream
await redis.xadd(
    'stream:task_events',
    '*',
    'userId', userId,
    'action', 'CREATE_TASK',
    'timestamp', Date.now().toString()
);
```

### 4. Real-time Notifications (Pub/Sub)

To sync state across connected clients, the backend publishes events to a Redis channel. The Socket.IO service
subscribes to this channel to broadcast updates to the frontend immediately.

**Usage Example:**

```typescript
// Publishing an update event
await redis.publish('channel:updates', JSON.stringify({userId, type: 'TASK_UPDATED', payload}));
```

## Installation and Setup

### Prerequisites

* Docker and Docker Compose
* Node.js (v20+) - *If running locally without Docker*

### Option 1: Running with Docker (Recommended)

This method spins up the Backend, Frontend, and the Redis Stack database simultaneously.

1. Clone the repository.
2. Navigate to the root directory.
3. Run the following command:

```bash
docker-compose up --build
```

The services will be available at:

* **Frontend:** http://localhost:3000
* **Backend:** http://localhost:4000
* **Redis Insight (GUI):** http://localhost:8001

### Option 2: Manual Installation

**1. Database Setup**
Ensure you have a Redis Stack instance running locally on port `6379`.

**2. Backend Setup**

```bash
cd Backend
npm install
# Create a .env file (see Configuration section)
npm run dev
```

**3. Frontend Setup**

```bash
cd Frontend
npm install
# Create a .env file (see Configuration section)
npm run dev
```

## Configuration

### Backend Environment Variables

Create a file named `.env` in the `Backend` directory.

| Variable     | Description                    | Default                  |
|--------------|--------------------------------|--------------------------|
| `PORT`       | The port the server listens on | `4000`                   |
| `REDIS_URL`  | Connection string for Redis    | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing tokens  | (Set a secure string)    |

### Frontend Environment Variables

Create a file named `.env` in the `Frontend` directory.

| Variable           | Description            | Example                 |
|--------------------|------------------------|-------------------------|
| `BACKEND_BASE_URL` | URL of the backend API | `http://localhost:4000` |

## API Overview

**Authentication**

* `POST /auth/signup` - Register a new user.
* `POST /auth/login` - Authenticate existing user.
* `GET /auth/me` - Retrieve current user profile.

**Tasks**

* `GET /tasks` - Retrieve all accessible tasks.
* `POST /tasks` - Create a new task.
* `PUT /tasks/:id` - Update task details.
* `DELETE /tasks/:id` - Delete a task.

**Collaboration**

* `POST /tasks/:id/share` - Invite a user to a task.
* `POST /tasks/:id/invite` - Accept or reject an invitation.
* `PUT /tasks/:id/share/:userId` - Update a participant's role.
* `DELETE /tasks/:id/share/:userId` - Revoke access.