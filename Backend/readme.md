# Task Tracker Backend

The Task Tracker backend is a RESTful API and real-time server for managing personal and collaborative tasks. It is
built with Node.js, Express, TypeScript, Redis (as a primary data store for JSON documents and search), and Socket.IO
for real-time updates.

## Project Purpose

This backend powers a productivity app where users can:

- Register and log in
- Create, update, and share tasks
- Organize tasks with categories and subtasks
- Collaborate with others in real time
- Earn XP through a gamified completion system

## Data Model

### User

- `id`: string
- `email`: string
- `username`: string
- `passwordHash`: string
- `xp`, `level`, `currentStreak`, `lastActive`: gamification fields

### Task

- `id`: string
- `ownerId`: string
- `title`: string
- `description`: string
- `category`: string (default: "General")
- `priority`: `low` | `medium` | `high` | `critical`
- `isCompleted`: boolean
- `createdAt`: timestamp
- `sharedWith`: array of `{ userId, role, status }` (role: `owner`, `editor`, `viewer`; status: `pending`, `accepted`)
- `subtasks`: array of `{ id, title, isComplete }`

## API Usage

All endpoints (except signup/login) require a JWT token in the `Authorization: Bearer <token>` header.

### Auth

#### Register

`POST /auth/signup`

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "username": "yourname"
}

```

**Response:** `{ "message": "User created", "token": "...", "user": {...} }` or error

#### Login

`POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}

```

**Response:** `{ "token": "<jwt>", "user": {...} }` or error

#### Get Current User

`GET /auth/me`
**Response:** `{ "id": "...", "username": "...", "xp": 100 }`

### Tasks

#### Get all tasks

`GET /tasks`
**Response:** Array of tasks (owned or shared with the user)

#### Create a task

`POST /tasks`

```json
{
  "title": "My Task",
  "description": "Details...",
  "priority": "medium",
  "category": "Work",
  "subtasks": [
    "First step",
    "Second step"
  ]
}

```

**Response:** Task object

#### Update a task

`PUT /tasks/:id`
*Completing a task grants the user XP.*

```json
{
  "title": "Updated title",
  "isCompleted": true
}

```

**Response:** `{ "success": true }`

#### Delete a task

`DELETE /tasks/:id`
**Response:** `{ "success": true, "message": "Task deleted successfully" }`

#### Add a subtask

`POST /tasks/:id/subtasks`

```json
{
  "title": "Subtask name"
}

```

**Response:** Subtask object

#### Share a task

`POST /tasks/:id/share`

```json
{
  "email": "collab@example.com",
  "role": "editor"
}

```

**Response:** `{ "message": "Invite sent to <username>" }`

#### Respond to Invite

`POST /tasks/:id/invite`

```json
{
  "accept": true
}

```

**Response:** `{ "success": true }`

## Real-Time Updates

Clients connect to the backend via Socket.IO. When tasks are updated, shared, deleted, or subtasks are added, relevant
users (owners and collaborators) receive real-time events.

**Events:**

* `TASK_UPDATED`: Payload contains `taskId` and updated fields.
* `SUBTASK_ADDED`: Payload contains `taskId` and the new subtask.
* `TASK_SHARED`: Sent to the invited user.
* `TASK_DELETED`: Payload contains `taskId`.

## Environment Variables

Create a `.env` file in the Backend directory:

```
PORT=4000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret

```
