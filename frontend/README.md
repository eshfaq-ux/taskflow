# TaskFlow Frontend

React + TypeScript + Vite frontend for the TaskFlow task board.

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** for build tooling and dev server
- Functional components with hooks
- Clean inline styles (no CSS framework)

## Project Structure

```
src/
├── components/
│   ├── Board.tsx            # Main board container
│   ├── Column.tsx           # Column with task list
│   ├── TaskCard.tsx         # Individual task card
│   ├── TaskForm.tsx         # Create task form
│   ├── TaskModal.tsx        # Edit/move/delete task modal
│   ├── PriorityFilter.tsx   # Priority filtering UI
│   ├── ErrorMessage.tsx     # Error display component
│   └── Loading.tsx          # Loading state component
├── services/
│   └── api.ts               # API client with error handling
├── types/
│   └── task.ts              # TypeScript type definitions
├── App.tsx
└── main.tsx
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` in this directory:

```env
VITE_API_URL=http://localhost:3001/api
```

For production, set `VITE_API_URL` to the deployed backend URL.

## Architecture Decisions

- **No Redux:** Board state is server-authoritative and refetched after mutations. Component state + useEffect is sufficient for this scale.
- **Dropdown for movement:** The assignment explicitly states "a working dropdown beats a broken drag-and-drop." Drag-and-drop could be added later without changing the API.
- **Refetch after mutations:** Prioritizes correctness over perceived performance — guarantees UI matches database state.
- **Priority filter uses API:** When a priority is selected, the frontend calls `GET /api/boards/:boardId/tasks?priority=High` to execute database-level filtering (WHERE clause in PostgreSQL), not in-memory JavaScript filtering.

## Component Responsibilities

- **Board:** Orchestrates state, API calls, and child components
- **Column:** Displays a column with its tasks
- **TaskCard:** Individual task card with title, description, priority, created date
- **TaskForm:** Modal form for creating new tasks
- **TaskModal:** Modal for viewing/editing/moving/deleting tasks
- **PriorityFilter:** Radio buttons for filtering by priority
- **Loading/ErrorMessage:** Reusable UI states
