# Project Tracker

A simple project and task tracking web application built as an OJT (On-the-Job Training) academic project. Teams can create projects, assign tasks, and track progress. Three roles — Project Manager, App Support, and Department/Estate Manager — each have different permission levels.

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM 7
- Axios
- React Icons (Remix Icons set)
- Plain CSS with CSS custom properties (no Tailwind, no CSS frameworks)

**Backend**
- Node.js + Express 4
- Supabase JS Client (database + auth)
- dotenv, cors, cookie-parser

**Database & Auth**
- Supabase (hosted PostgreSQL + built-in authentication)

**Dev Tools**
- Nodemon, Concurrently

## Setup Instructions

### Prerequisites
- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) account

### 1. Clone the repository

```bash
git clone <repository-url>
cd projectTracker
```

### 2. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Note your Project URL, `anon` key, and `service_role` key (Project Settings → API).
3. Open the SQL Editor and run the full schema from `PROJECT_TRACKER_SPEC.md` (Section 5), which creates the `profiles`, `projects`, and `tasks` tables, the auto-profile-creation trigger, and RLS policies.
4. Create the three test accounts under Authentication → Users (see [Test Accounts](#test-accounts) below) — add each one's `full_name` and `role` as user metadata so the trigger populates their profile correctly.

### 4. Configure environment variables

Copy the example files and fill in your Supabase credentials:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

`.env` (root):
```
VITE_API_URL=http://localhost:3000/api
```

`backend/.env`:
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
CLIENT_URL=http://localhost:5173
```

### 5. Start the servers

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

Or run them separately:
```bash
npm run dev                          # frontend only
cd backend && npm run dev            # backend only
```

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Project Manager | pm@tracker.com | password123 |
| App Support | support@tracker.com | password123 |
| Dept/Estate Manager | manager@tracker.com | password123 |

## Folder Structure

```
project-tracker/
├── backend/
│   ├── config/          # Supabase client setup
│   ├── controllers/      # Route business logic
│   ├── middleware/       # Auth + role guards
│   ├── routes/           # Express route definitions
│   └── server.js
│
├── src/
│   ├── api/              # Axios instance + per-resource API modules
│   ├── components/common/  # Sidebar, Toast, ConfirmModal, StatusBadge, etc.
│   ├── context/           # AuthContext, ToastContext
│   ├── pages/             # Login, Dashboard, Projects, Profile, NotFound
│   ├── styles/            # Design system CSS variables
│   └── App.jsx
│
└── public/
```

## Role Permissions

| Feature | Project Manager | App Support | Dept Manager |
|---|---|---|---|
| View dashboard / projects / tasks | ✔ | ✔ | ✔ |
| Create / edit / delete project | ✔ | ✘ | ✘ |
| Create / edit / delete task | ✔ | ✔ | ✘ |
| View users list | ✔ | ✔ | ✘ |

## Screenshots

_Add screenshots of the Login, Dashboard, Projects, and Profile pages here._
