# Development Log — TaskFlow

A week-by-week journal of how TaskFlow was designed and built.

---

## Week 1 — Planning & Architecture

**Goals:** Understand requirements, design the data model, choose the tech stack.

Started by mapping out what a Trello-like system actually needs — users, boards, columns, cards. Drew out the entity relationships on paper before writing any code.

Key decisions made this week:
- Chose FastAPI over Flask for automatic Swagger docs and built-in request validation
- Decided on MySQL over PostgreSQL purely based on familiarity
- Settled on JWT for auth — stateless tokens that don't require a session store
- Chose Vite over Create React App for much faster dev server startup

**Challenges:**
- Spent time deciding how to handle card ordering. Went with a simple integer `position` field rather than linked-list ordering. Good enough for now.
- Debated whether to use a flat card model or a nested document approach. Relational won — it's cleaner for this type of data.

**Database schema finalized:**
```
users → boards → task_columns → cards ← card_assignments → users
```

---

## Week 2 — Backend Foundation & Authentication

**Goals:** Get the FastAPI server running with a working auth system.

Set up the project structure with separate folders for models, schemas, routers, and services. The service layer separation felt slightly over-engineered for the scope, but it pays off when unit testing becomes necessary.

**What was built:**
- SQLAlchemy models for all five tables
- Alembic migration for initial schema
- `/auth/register` and `/auth/login` endpoints
- JWT generation and decoding via `python-jose`
- bcrypt password hashing via `passlib`
- `get_current_user` FastAPI dependency — used on every protected route

**Stumbling blocks:**
- Ran into an issue with Alembic not detecting model changes because the models weren't imported in `env.py`. Fixed by explicitly importing all model modules.
- Had to add `pool_pre_ping=True` to the SQLAlchemy engine after getting stale connection errors on the MySQL side.

**TODO added this week:**
```python
# TODO: add email verification before account activation
# TODO: refresh token endpoint for long-lived sessions
```

---

## Week 3 — Boards, Columns, and Cards API

**Goals:** Complete the core CRUD API for boards, columns, and cards.

This was the busiest week. Built and tested all the resource endpoints.

**What was built:**
- Boards CRUD with auto-creation of 3 default columns on new board
- Columns CRUD with board access verification
- Cards CRUD with position tracking and user assignment sync
- Dashboard stats aggregation endpoint

**Design decisions made:**
- When creating a board, the server automatically seeds "To Do", "In Progress", "Done" columns. This avoids an extra round-trip from the frontend and makes the UX smoother.
- Card assignment is implemented as a full replace (delete old assignments, insert new) rather than a diff. Simpler to reason about.

**Challenges:**
- The `_attach_assigned_users` helper function feels a bit hacky — it mutates the card object to add the `assigned_users` list. A cleaner solution would be a proper `CardWithUsers` SQLAlchemy query with a join. Noted as a refactor item.

```python
# TODO: refactor card serialization to use a proper JOIN instead of N+1 queries
```

---

## Week 4 — Frontend & UI

**Goals:** Build the React frontend, connect it to the API, and polish the UI.

Started with the auth context and API layer before building any components. Having the data layer locked in first made component development much cleaner.

**What was built:**
- Axios instance with JWT interceptor and global 401 redirect
- `AuthContext` for global user state
- `useBoards` and `useCards` custom hooks
- Login and Register pages with glassmorphism design
- Dashboard with stats cards and board grid
- KanbanBoard → KanbanColumn → KanbanCard component tree
- TaskModal for creating and editing cards
- CreateBoardModal and EditBoardModal

**Design choices:**
- Dark theme (`gray-950` base) throughout — more modern and easier on the eyes
- Color-coded priority badges (green/amber/red)
- Greeting on dashboard ("Good morning / afternoon / evening") — small personal touch

**Challenges:**
- The modal z-index stacking caused issues until backdrop-blur was applied correctly.
- Had to handle the card column change carefully in `useCards` — a card move requires a full board refetch to maintain consistency.

**Polling added for dashboard stats:**
```javascript
// Polling every 30s — consider WebSocket upgrade later when we have team collaboration
const interval = setInterval(loadStats, 30000);
```

---

## Week 5 — Testing, Fixes & Documentation

**Goals:** Test end-to-end flows, fix edge cases, write documentation.

**Testing done:**
- Tested complete auth flow: register → login → protected route access → logout
- Tested board CRUD: create → view → edit → delete (cascade verification)
- Tested card flow: create in To Do → edit → move to Done → delete
- Tested assignment: assigning multiple users, removing users

**Fixes:**
- Fixed 404 error when navigating directly to a board URL by adding proper error handling and redirect in `BoardPage`
- Fixed `isPastDue` returning wrong result for ISO date strings — had to use `parseISO` from `date-fns`
- Fixed CORS error during local dev by adding `http://localhost:5173` to allowed origins

**Documentation written:**
- `README.md` — setup instructions, API reference, feature list
- `docs/database-design.md` — ER diagram and table descriptions
- `docs/architecture-decisions.md` — tech choices and trade-offs
- `docs/development-log.md` — this file
- `docs/demo-script.md` — Loom walkthrough script

**Known remaining issues / future work:**
- Card drag-and-drop is not implemented — cards can be moved via the edit modal
- No unit tests yet — would add pytest for the service layer next
- Assignment UI could be improved — currently just stores empty array; UI for user selection not built
