
# Task Tracker Backend

The Task Tracker backend is a RESTful API and real-time server for managing personal and collaborative tasks. It is built with Node.js, Express, TypeScript, Redis (as a primary data store), and Socket.IO for real-time updates.

## Project Purpose
This backend powers a productivity app where users can:
- Register and log in
- Create, update, and share tasks
- Add subtasks
- Collaborate with others in real time

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
- `priority`: `low` | `medium` | `high` | `critical`
- `status`: `pending` | `completed`
- `createdAt`: timestamp
- `sharedWith`: array of `{ userId, role }` (role: `owner`, `editor`, `viewer`)
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
**Response:** `{ "message": "User created" }` or error

#### Login
`POST /auth/login`
```json
{
	"email": "user@example.com",
	"password": "yourpassword"
}
```
**Response:** `{ "token": "<jwt>" }` or error

### Tasks

#### Get all tasks
`GET /tasks`
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of tasks (owned or shared)

#### Create a task
`POST /tasks`
```json
{
	"title": "My Task",
	"description": "Details...",
	"priority": "medium"
}
```
**Response:** Task object

#### Update a task
`PUT /tasks/:id`
```json
{
	"title": "Updated title",
	"status": "completed"
}
```
**Response:** `{ "success": true }`

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
**Response:** `{ "message": "Shared with <username>" }`

## Real-Time Updates

Clients connect to the backend via Socket.IO (port 4000). When tasks are updated, shared, or subtasks are added, relevant users receive real-time events. Each user joins a room with their userId for targeted updates.

## Example Usage

1. Register and log in to get a token.
2. Use the token to create, update, and share tasks via the API.
3. Connect to the websocket for instant updates when tasks change.

## Environment Variables
Create a `.env` file in the Backend directory:
```
PORT=4000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
```

## License
MIT
