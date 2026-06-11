# Demo Script — TaskFlow Loom Walkthrough

**Estimated Duration:** 5 minutes  
**Format:** Screen recording with voiceover

---

## [0:00 – 0:30] Introduction

> "Hi, I'm [Your Name], and this is TaskFlow — a multi-user task management system I built for the Azentrix Full Stack Developer Internship.
>
> TaskFlow is inspired by Trello. You can create boards, organize tasks into columns, set priorities and due dates, and track your progress through a dashboard. Let me walk you through the project."

---

## [0:30 – 1:00] Project Overview & Architecture

> "The stack is React and Vite on the frontend, FastAPI with Python on the backend, and MySQL for the database. Authentication is handled with JWT tokens.
>
> I organized the backend into routers, services, and models — keeping each layer responsible for one thing. The frontend uses custom hooks to manage data fetching, which keeps the components clean."

*Show the project folder structure in VS Code*

---

## [1:00 – 1:45] Database Design

> "Let me quickly show the database schema. There are five tables — users, boards, task_columns, cards, and card_assignments. Cards belong to columns, columns belong to boards, and cards can be assigned to multiple users through a join table.
>
> I used Alembic for schema migrations, so the database schema is version-controlled just like the application code."

*Show `docs/database-design.md` with the ER diagram*

---

## [1:45 – 2:30] Authentication

> "Let me show authentication in action. I'll register a new account here."

*Demo:*
1. Navigate to `/register`
2. Fill in name, email, password, select role
3. Click Create Account
4. Show auto-redirect to dashboard

> "After registering, I'm immediately logged in and taken to the dashboard. The JWT token is stored in localStorage and sent automatically with every API request."

*Show browser localStorage to demonstrate token storage*

---

## [2:30 – 3:30] Board Management

> "On the dashboard I can see all my boards, stats, and recent activity. Let me create a new board."

*Demo:*
1. Click "New Board"
2. Enter title "Product Roadmap", add description
3. Pick a color
4. Click Create Board
5. Board appears in the grid
6. Click into the board

> "Each board automatically gets three columns — To Do, In Progress, and Done. I can click into any board to open the Kanban view."

---

## [3:30 – 4:15] Task Management

> "Now let me add some cards. I'll click the plus icon on the To Do column."

*Demo:*
1. Click + on To Do column
2. Fill in title "Design login page mockup"
3. Set priority to High
4. Set a due date
5. Click Create Card
6. Card appears in column
7. Click the card to open edit modal
8. Change column to "In Progress"
9. Save — card moves to In Progress column

> "Cards can be edited to update their status — here I'm moving a card from To Do to In Progress by changing its column. You can also set priority levels, and overdue cards are highlighted in red."

---

## [4:15 – 4:45] Challenges Faced

> "A few challenges I ran into during development:
>
> First, Alembic wasn't detecting my models until I realized I needed to explicitly import them in `env.py` — easy fix once I understood what was happening.
>
> Second, I got stale database connection errors from MySQL until I added `pool_pre_ping=True` to the SQLAlchemy engine config.
>
> Third, the CORS setup — I had to make sure the FastAPI backend allowed requests from the Vite dev server port."

---

## [4:45 – 5:00] Future Improvements

> "Some things I'd love to add given more time:
>
> Drag-and-drop card reordering using a library like `dnd-kit`. Real-time updates with WebSockets instead of polling. Email notifications for approaching due dates. And proper unit tests for the service layer using pytest.
>
> The foundation is solid enough that these are all additive improvements rather than architectural changes.
>
> Thanks for watching — the full source code is on GitHub with setup instructions in the README."

---

## Tips for Recording

- Open both the frontend (`localhost:5173`) and the Swagger docs (`localhost:8000/docs`) in separate browser tabs
- Use a 1080p or 1440p screen recording
- Speak clearly and at a moderate pace — don't rush through demos
- Pause briefly after navigating to a new page before speaking
- Have sample data pre-created in another account to show a fuller dashboard
