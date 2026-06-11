# Architecture Decisions — TaskFlow

This document explains the reasoning behind each major technology and architectural choice made in TaskFlow.

---

## Frontend: React + Vite + TailwindCSS

**Why React?**
React's component model maps naturally to a Kanban UI — boards, columns, and cards are self-contained units of UI state. The hook ecosystem (useState, useEffect, useContext) keeps logic co-located without needing a heavy state management library like Redux.

*Trade-off considered:* Vue.js was considered for its simpler learning curve, but React has a larger job market relevance for the internship context.

**Why Vite?**
Vite's dev server starts in milliseconds compared to Create React App's slower webpack builds. For a project with many components being iterated on rapidly, fast HMR (Hot Module Replacement) makes a real productivity difference.

**Why TailwindCSS?**
Tailwind eliminates context-switching between JSX and CSS files. Utility classes kept the dark-mode-first design consistent without maintaining a complex stylesheet. The purge/content config ensures only used classes ship in the production bundle.

*Trade-off:* Class attributes become verbose. Accepted this trade-off for development speed.

---

## Backend: Python + FastAPI

**Why FastAPI?**
- Automatic OpenAPI/Swagger documentation at `/docs` — essential for testing during development
- Python type hints + Pydantic validate request bodies automatically, reducing boilerplate error handling
- Async support (though not used heavily here) leaves room for future performance scaling
- Dependency injection via `Depends()` makes JWT authentication reusable across all protected routes

*Alternative considered:* Flask. FastAPI was chosen because its built-in validation and documentation saves significant development time.

**Why a service layer?**
Business logic (e.g., card assignment syncing, position calculation) lives in `app/services/` rather than directly in routers. This keeps routers thin and makes the logic independently testable.

```
Router → validates input, calls service → handles business logic, queries DB
```

---

## Database: MySQL

**Why MySQL?**
- Relational data with clear relationships (users → boards → columns → cards) maps perfectly to a SQL schema
- MySQL is widely available, well-documented, and familiar
- Foreign keys with CASCADE DELETE ensure data integrity automatically

*Alternative considered:* SQLite for development simplicity. MySQL was chosen to reflect a production-realistic setup.

**Why SQLAlchemy + Alembic?**
SQLAlchemy's ORM allows writing Python classes instead of raw SQL, which is more readable and less error-prone. Alembic provides versioned schema migrations — critical for team development where schema changes need to be tracked and reproducible.

---

## Authentication: JWT

**Why JWT (JSON Web Tokens)?**
JWTs are stateless — the server doesn't need to store sessions in a database or cache. Each token contains the user's ID and expiry, so authentication scales horizontally without a shared session store.

**Token flow:**
1. User posts credentials → server validates → returns signed JWT
2. Client stores JWT in `localStorage`
3. Every subsequent request includes `Authorization: Bearer <token>`
4. Server decodes and validates the token on each request via the `get_current_user` dependency

*Trade-off:* Tokens can't be invalidated before expiry without a blocklist. Accepted for simplicity — the short 60-minute expiry mitigates risk.

---

## Polling vs WebSockets

**Why polling (not WebSockets)?**
The dashboard polls for stats every 30 seconds via `setInterval`. This was a deliberate pragmatic choice:

- WebSocket infrastructure requires more server complexity (connection management, reconnect logic)
- For a task board with moderate update frequency, 30-second polling is acceptable UX
- Polling is significantly simpler to debug and test

*Future:* WebSockets would be the right upgrade path when real-time collaboration becomes a requirement.

---

## What Was Intentionally Left Out

| Feature | Reason |
|---|---|
| Docker | Added complexity without meaningful benefit at this scale |
| Redis | No caching requirements identified yet |
| Microservices | Overkill — a monolith is the right starting point |
| Prisma | Python stack doesn't use Node-based ORMs |
| Email notifications | Noted as future improvement; SMTP setup out of scope |
