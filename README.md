# TaskFlow

A lightweight task board application for small teams, built as a full-stack take-home assignment.

## Overview

TaskFlow is a Trello-inspired task management system that allows teams to organize work across columns (To Do, In Progress, Done), create and edit tasks with priorities, and filter tasks by priority. All data persists in a relational database with proper validation and error handling.

**Live Demo:** _(will be added after deployment)_

**Repository:** https://github.com/eshfaq-ux/taskflow

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- Functional components with hooks
- Inline styles (no CSS framework — keeping it simple per assignment requirements)

### Backend
- **Node.js 20** with Express
- **TypeScript** in strict mode
- **PostgreSQL** via `pg` driver (async connection pool)
- RESTful API design

### Database
- **PostgreSQL** with connection pooling
- Relational schema: `boards → columns → tasks`
- Database-level queries for filtering and aggregation

### Testing
- **Vitest** for backend unit and integration tests
- **Supertest** for HTTP endpoint testing
- 14 passing tests covering validation, CRUD, database queries, and edge cases

---

## Architecture

```
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # Database schema definition
│   │   │   ├── seed.sql            # Initial seed data
│   │   │   ├── database.ts         # Database connection and initialization
│   │   │   └── queries.ts          # Required SQL queries (showcased here)
│   │   ├── routes/
│   │   │   └── tasks.routes.ts     # API route definitions
│   │   ├── controllers/
│   │   │   └── tasks.controller.ts # Request/response handling
│   │   ├── services/
│   │   │   └── tasks.service.ts    # Business logic and validation
│   │   ├── middleware/
│   │   │   └── errorHandler.ts     # Centralized error handling
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   ├── tests/
│   │   └── api.test.ts             # Backend tests
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Board.tsx           # Main board container
    │   │   ├── Column.tsx          # Column with task list
    │   │   ├── TaskCard.tsx        # Individual task card
    │   │   ├── TaskForm.tsx        # Create task form
    │   │   ├── TaskModal.tsx       # Edit/move/delete task modal
    │   │   ├── PriorityFilter.tsx  # Priority filtering UI
    │   │   ├── ErrorMessage.tsx    # Error display component
    │   │   └── Loading.tsx         # Loading state component
    │   ├── services/
    │   │   └── api.ts              # API client with error handling
    │   ├── types/
    │   │   └── task.ts             # TypeScript type definitions
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

### Architectural Responsibilities

- **Routes:** Define HTTP endpoints
- **Controllers:** Handle request/response, parameter validation
- **Services:** Business logic, data validation, database operations
- **Database layer:** SQL queries, connection management
- **Middleware:** Cross-cutting concerns (error handling, CORS)

---

## Database Schema

TaskFlow uses a normalized relational schema with proper foreign keys and constraints.

```sql
boards
  ├── id (PRIMARY KEY)
  └── name (NOT NULL)

columns
  ├── id (PRIMARY KEY)
  ├── board_id (FOREIGN KEY → boards.id, ON DELETE CASCADE)
  ├── name (NOT NULL)
  └── position (NOT NULL)

tasks
  ├── id (PRIMARY KEY)
  ├── column_id (FOREIGN KEY → columns.id, ON DELETE CASCADE)
  ├── title (NOT NULL)
  ├── description (optional)
  ├── priority (CHECK constraint: 'Low', 'Medium', 'High')
  └── created_at (NOT NULL, defaults to current timestamp)
```

### Design Decision: `column_id` as Task Status

A task's **status** (To Do, In Progress, Done) is represented by its `column_id` foreign key, not a separate `status` field. This design:

- **Eliminates redundancy:** No need to keep `column_id` and `status` in sync
- **Enforces referential integrity:** A task cannot exist in a non-existent column
- **Simplifies queries:** Moving a task is a single `UPDATE tasks SET column_id = ? WHERE id = ?`
- **Scales naturally:** Adding new columns (e.g. "Blocked", "Review") requires no schema migration

**Trade-off:** Querying tasks by status requires a JOIN to the `columns` table, but this is negligible for SQLite at this scale and properly indexed.

---

## Required SQL Queries

The assignment specifically requires database-level queries that perform filtering and aggregation **in SQLite**, not by fetching all rows and filtering in JavaScript.

Both queries are implemented in `backend/src/db/queries.ts` for easy inspection.

### Query 1: Task count per column

Returns the number of tasks in each column for a given board. Uses `LEFT JOIN` so columns with zero tasks are still included.

```sql
SELECT
  c.id,
  c.name,
  COUNT(t.id) AS task_count
FROM columns c
LEFT JOIN tasks t
  ON t.column_id = c.id
WHERE c.board_id = ?
GROUP BY c.id, c.name
ORDER BY c.position, c.id
```

**Why LEFT JOIN?** An `INNER JOIN` would omit empty columns from the result. We want to show "To Do (0)" even when there are no tasks.

### Query 2: Tasks by priority, newest first

Retrieves all tasks matching a given priority for a board, ordered by creation date descending.

```sql
SELECT
  t.id,
  t.title,
  t.description,
  t.priority,
  t.created_at,
  t.column_id
FROM tasks t
JOIN columns c
  ON c.id = t.column_id
WHERE c.board_id = ?
  AND t.priority = ?
ORDER BY t.created_at DESC
```

**Why at the database layer?** This query filters and sorts **before** returning rows to the application, not after. For 10,000 tasks, this is the difference between transferring 10,000 rows vs. 50 rows.

---

## API

All endpoints return JSON. Errors follow the format `{ "error": "message" }`.

### GET `/api/boards/:boardId`
Fetch a board with its columns and tasks.

**Response:**
```json
{
  "id": 1,
  "name": "My Team Board",
  "columns": [
    {
      "id": 1,
      "name": "To Do",
      "position": 0,
      "tasks": [
        {
          "id": 1,
          "column_id": 1,
          "title": "Set up CI pipeline",
          "description": "Configure GitHub Actions",
          "priority": "High",
          "created_at": "2026-08-01T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

### GET `/api/boards/:boardId/tasks?priority=High`
Filter tasks by priority (database-level query).

### GET `/api/boards/:boardId/column-counts`
Get task counts per column (uses Query 1).

### POST `/api/tasks`
Create a new task.

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "Optional description",
  "priority": "High",
  "columnId": 1
}
```

**Validation:**
- `title` is required (trimmed, non-empty)
- `priority` must be "Low", "Medium", or "High"
- `columnId` must reference an existing column

### PATCH `/api/tasks/:taskId`
Update a task's title, description, or priority.

### PATCH `/api/tasks/:taskId/move`
Move a task to a different column.

**Request:**
```json
{
  "columnId": 2
}
```

### DELETE `/api/tasks/:taskId`
Delete a task.

---

## Local Setup

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 12+ (local or hosted instance)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/eshfaq-ux/taskflow.git
cd taskflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
```

For testing (optional — uses separate test database):
```env
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/taskflow_test
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Running the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:3001`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173`

Open http://localhost:5173 in your browser.

### Database Setup

The database is **automatically initialized** on first run:
1. `schema.sql` creates tables with constraints
2. `seed.sql` populates initial data (1 board, 3 columns, 8 tasks) if the database is empty

**Local PostgreSQL setup:**
```bash
# Create database
createdb taskflow

# Optional: Create test database
createdb taskflow_test

# The backend will run schema.sql and seed.sql automatically on startup
```

To reset the database, drop and recreate it:
```bash
dropdb taskflow
createdb taskflow
```

---

## Running Tests

```bash
cd backend
npm test
```

**Test coverage:**
- ✅ Creating a task without a title fails (empty string and whitespace-only)
- ✅ Moving a task updates its column correctly and persists to the database
- ✅ Database query for task count per column returns correct results
- ✅ Database query for priority filtering returns newest tasks first
- ✅ Creating a valid task succeeds
- ✅ Invalid priority is rejected
- ✅ Editing a task works
- ✅ Deleting a task works
- ✅ Nonexistent task returns 404
- ✅ Nonexistent destination column is rejected
- ✅ Columns with zero tasks are included in count query

**14 tests, all passing.**

Tests use a dedicated PostgreSQL test database (set via `TEST_DATABASE_URL`) that is wiped and reseeded before each test run, ensuring deterministic results.

---

## Design Decisions

### PostgreSQL over SQLite
- **Production-ready:** PostgreSQL handles concurrent writes and scales horizontally
- **Free hosting:** Railway, Render, Neon, Supabase all offer free PostgreSQL tiers
- **No file storage needed:** Cloud databases eliminate the need for persistent disk mounts
- **Industry standard:** PostgreSQL is battle-tested for production workloads
- **Explicit SQL:** The assignment evaluates SQL query skills, not ORM configuration

### pg driver over Prisma/TypeORM
- **Direct SQL control:** Assignment requires visible, readable SQL queries
- **Async/await:** Modern `pg` driver with connection pooling
- **Type-safe:** Works seamlessly with TypeScript generics
- **Zero magic:** No hidden query generation or N+1 pitfalls

### Backend Validation as Source of Truth
Frontend validation provides immediate feedback, but the backend **always** validates:
- Prevents bypassing client-side validation via direct API calls
- Title is trimmed and checked for emptiness
- Priority is constrained to valid values
- Foreign keys (column existence) are verified before insertion

### No Redux
- **Unnecessary complexity:** Board state is server-authoritative and refetched after mutations
- **Simpler mental model:** Component state and `useEffect` are sufficient
- **Faster development:** No action creators, reducers, or selectors needed

### Dropdown for Task Movement (Not Drag-and-Drop)
The assignment explicitly states: *"A working dropdown beats a broken drag-and-drop."*

- **Reliable:** Works on all devices and browsers
- **Accessible:** Keyboard-navigable, screen-reader friendly
- **Simple:** Fewer edge cases and less code to debug

Drag-and-drop could be added as a future enhancement without changing the API.

### Refetch After Mutations (Not Optimistic UI)
After creating, updating, moving, or deleting a task, the board is refetched from the backend.

**Why?** The assignment prioritizes **correctness** over perceived performance:
- Guarantees UI matches database state
- Avoids race conditions from concurrent updates
- Simpler error recovery (a failed mutation doesn't leave stale UI)

At scale, optimistic updates would improve UX, but the current approach is more reliable.

### Test Database Strategy
Tests use a separate PostgreSQL test database (`TEST_DATABASE_URL`) that is reset before the suite runs.

- **Isolation:** Tests don't interfere with the development database
- **Determinism:** Known seed data ensures predictable assertions
- **No mocking:** Tests exercise the real database layer

---

## Assumptions

The assignment intentionally leaves some details open. Here are the assumptions I made:

1. **Single board:** The schema supports multiple boards, but the UI hard-codes board ID 1. Adding a board picker would be trivial.
2. **No authentication:** All users see the same board. User accounts are explicitly out of scope.
3. **No real-time updates:** Refreshing the page is required to see changes made by others. WebSockets are out of scope.
4. **Task creation defaults to "Medium" priority:** If the user doesn't select a priority, it defaults to Medium.
5. **Column order is determined by `position` field:** Columns are displayed in ascending `position` order, not alphabetically.
6. **Browser confirmation for delete:** A native `confirm()` dialog is used for delete confirmation. A custom modal would be better for production but adds unnecessary complexity for this assignment.
7. **No pagination:** All tasks for a board are loaded at once. Fine for small teams; would need pagination for boards with 1000+ tasks.

---

## What I Would Improve

Given more time or for a production system, I would add:

### Short-term (next sprint)
- **Drag-and-drop:** Use `@dnd-kit/core` for a nicer task movement experience
- **Text search:** Filter tasks by title/description (already has database support, just needs UI)
- **Task reordering within columns:** Add a `position` field to tasks
- **Keyboard shortcuts:** `n` to create task, `?` to show help modal
- **Toast notifications:** Replace error boxes with subtle toast messages

### Medium-term (next month)
- **Optimistic UI updates:** Immediate visual feedback, rollback on error
- **Multiple boards:** Board picker in the header
- **Task assignees:** Many-to-many relationship with a `users` table
- **Due dates and reminders:** Add `due_date` field and email notifications
- **Activity log:** Track who created/edited/moved each task
- **Dark mode:** CSS variables and a toggle in the header

### Long-term (production at scale)
- **PostgreSQL:** SQLite is fine for small teams but doesn't support concurrent writes at scale
- **Authentication:** Auth0 or Clerk for user management
- **WebSocket updates:** Real-time board synchronization via Socket.io
- **Team permissions:** Read-only vs. edit access per board
- **Task templates:** Predefined task structures for common workflows
- **API rate limiting:** Prevent abuse
- **Comprehensive frontend tests:** Vitest + React Testing Library for component coverage
- **CI/CD pipeline:** GitHub Actions for automated testing and deployment

---

## Time Spent

Approximately **6 hours** over 2 days:
- Database schema and seed data: 45 minutes
- Backend API and validation: 1.5 hours
- Backend tests: 1 hour
- Frontend UI components: 2 hours
- Manual testing and bug fixes: 45 minutes
- Documentation (this README): 45 minutes

---

## Interesting Thing Learned

I learned (or relearned with fresh appreciation) the importance of **database-level filtering** vs. application-level filtering.

Initially, I almost implemented the priority filter as:

```typescript
// ❌ BAD: Fetch everything, filter in JavaScript
const allTasks = await db.getAllTasks(boardId);
const filtered = allTasks.filter(t => t.priority === priority);
```

But the assignment specifically calls this out: *"Do not retrieve all tasks and filter them in JavaScript."*

This forced me to write a proper SQL query with a `WHERE` clause:

```sql
-- ✅ GOOD: Filter in the database
SELECT * FROM tasks WHERE priority = ? AND board_id = ?
```

**Why does this matter?**

For 10 tasks, it's irrelevant. For 10,000 tasks, it's the difference between:
- Transferring 10,000 rows over the network (bad)
- Transferring 500 matching rows (good)

It also:
- Reduces memory usage in the Node.js process
- Allows the database to use indexes efficiently
- Makes the application stateless (easier to scale horizontally)

This is a **fundamental principle of backend engineering** that I'll carry into every future project: **push computation to the data, not the other way around.**

---

## Deployment

_(To be completed before final submission)_

The application will be deployed to:
- **Backend:** Railway or Render (persistent SQLite storage)
- **Frontend:** Vercel or Netlify

Live URL will be added here after deployment is verified.

---

## License

This project was created as a take-home assignment. All rights reserved.

---

## Contact

For questions about this project, please reach out via the Internshala application portal.
