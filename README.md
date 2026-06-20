# TaskFlow — Multi-User Task Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> A full-stack Kanban-style task management system inspired by Trello, built with React, FastAPI, and MySQL.

---

## Live Demo 

- **Frontend (Vercel):** [https://azentrix-fullstack-task2-mu.vercel.app/](https://azentrix-fullstack-task2-mu.vercel.app/)
- **Backend API (Railway):** [https://azentrix-fullstack-task2-production.up.railway.app](https://azentrix-fullstack-task2-production.up.railway.app)

---

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login Page](screenshots/login-page.png) | ![Dashboard](screenshots/dashboard1.png) |

| Board View | Task Management |
|---|---|
| ![Board View](screenshots/Board-view.png) | ![Task Management](screenshots/task-management.png) |

---

## Demo Video

[▶️ Watch the 5-minute Loom Walkthrough](https://www.loom.com/)

---

## Features

### Authentication
- User registration and login with JWT tokens
- Role-based access: **Admin** and **Member**
- Auto-login after registration
- Persistent sessions via localStorage

### Admin User Management
- View all registered users
- Change user roles (Admin / Member)
- Delete users securely
- Protected admin-only dashboard

### Boards
- Create, edit, and delete boards
- Custom color themes per board
- Board overview on dashboard

### Kanban Columns
- Three default columns per board: **To Do**, **In Progress**, **Done**
- Cards automatically scoped per column

### Cards / Tasks
- Create, edit, delete cards
- Set **priority** (Low / Medium / High)
- Add **due dates** with past-due highlighting
- **Assign users** to cards
- Move cards between columns

### Dashboard
- Board overview with stats
- Card count breakdown by status and priority
- Progress bars for priority distribution
- Auto-refreshing stats (polling every 30s)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS v3, React Router DOM |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Database | MySQL 8 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| HTTP Client | Axios |

---

## Project Structure

```
taskflow/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios API layer
│   │   ├── components/         # Reusable UI components
│   │   │   ├── auth/
│   │   │   ├── board/
│   │   │   ├── kanban/
│   │   │   ├── task/
│   │   │   └── dashboard/
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # useBoards, useCards
│   │   ├── pages/              # LoginPage, RegisterPage, DashboardPage, BoardPage
│   │   └── utils/              # formatDate, priorityColors
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/               # config, security, dependencies
│   │   ├── models/             # SQLAlchemy models
│   │   ├── routers/            # API route handlers
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic
│   │   ├── alembic/            # Database migrations
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
│
├── docs/
│   ├── architecture-decisions.md
│   ├── database-design.md
│   ├── development-log.md
│   └── demo-script.md
│
├── screenshots/
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **MySQL** 8.0+

---

### 1. Clone the repository

```bash
git clone https://github.com/CodedByAdi/-azentrix-fullstack-task2.git
cd -azentrix-fullstack-task2
```

---

### 2. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create the environment file:

```bash
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/taskflow
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Swagger docs: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | — |
| `SECRET_KEY` | JWT signing secret | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes | `60` |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/users/` | List all users (Admin only) |
| `PUT` | `/users/{id}/role` | Update user role (Admin only) |
| `DELETE` | `/users/{id}` | Delete user (Admin only) |
| `GET` | `/boards/` | List all boards |
| `POST` | `/boards/` | Create a board |
| `PATCH` | `/boards/{id}` | Update a board |
| `DELETE` | `/boards/{id}` | Delete a board |
| `GET` | `/columns/board/{boardId}` | Get columns for a board |
| `GET` | `/columns/{id}/cards` | Get cards in a column |
| `POST` | `/cards/` | Create a card |
| `PATCH` | `/cards/{id}` | Update a card |
| `DELETE` | `/cards/{id}` | Delete a card |
| `GET` | `/dashboard/stats` | Get dashboard statistics |

---

## Future Improvements

- [ ] Email notifications for due dates
- [ ] Card comments and activity feed
- [ ] File attachments on cards
- [ ] Board templates
- [ ] Mobile app (React Native)

---

## Architecture

TaskFlow uses a modern, decoupled architecture:
- **Frontend**: React SPA communicating with the backend via REST APIs. Uses custom hooks (`useCards`, `useBoards`) for state handling.
- **Backend**: FastAPI layered architecture. Routers handle HTTP requests, services contain business logic, and models define the database schema.
- **Database**: Relational data model in MySQL with strict foreign key constraints and cascade deletes to ensure data integrity.
- **Authentication**: Stateless JWT token-based authentication.

See [`docs/architecture-decisions.md`](docs/architecture-decisions.md) for detailed reasoning behind every tech choice.

---

## Development Log

See [`docs/development-log.md`](docs/development-log.md) for a week-by-week breakdown of how the project was built.

---

## Database Design

See [`docs/database-design.md`](docs/database-design.md) for the ER diagram and table relationships.

---

