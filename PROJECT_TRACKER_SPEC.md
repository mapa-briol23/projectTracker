# Project Tracker Web Application — Complete Development Specification

> **Purpose:** This document is the single source of truth for building a simple Project Tracker Web Application. It is designed to be fed to Claude Code in VS Code, one phase at a time, to incrementally build the entire project.
>
> **Context:** This is an OJT (On-the-Job Training) academic output. It must remain simple, clean, beginner-friendly, and easy to explain during a defense presentation. It is NOT a production application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication Flow](#6-authentication-flow)
7. [API Endpoints](#7-api-endpoints)
8. [Role Permissions Matrix](#8-role-permissions-matrix)
9. [Page Specifications](#9-page-specifications)
10. [Component Specifications](#10-component-specifications)
11. [UI/UX Design System](#11-uiux-design-system)
12. [Development Phases & Claude Code Prompts](#12-development-phases--claude-code-prompts)

---

## 1. Project Overview

### What It Is
A simple CRUD web application that allows teams to create projects, assign tasks, and track progress. Three user roles (Project Manager, App Support, Department/Estate Manager) have different permission levels.

### Use Cases (from Use Case Diagram)
| Use Case | Project Manager | App Support | Dept/Estate Manager |
|---|---|---|---|
| Login | ✔ | ✔ | ✔ |
| Create Project | ✔ | ✘ | ✘ |
| Edit Project Details | ✔ | ✘ | ✘ |
| Assign Task | ✔ | ✔ | ✘ |
| Update Progress | ✔ | ✔ | ✘ |
| Track Progress | ✔ | ✔ | ✔ |
| View Project Details | ✔ | ✔ | ✔ |

### Actors
- **Project Manager** — Full access. Creates/edits projects, assigns tasks, updates progress.
- **Project / App Support** — Operational access. Assigns tasks and updates progress. Cannot create/edit projects.
- **Department / Estate Manager** — View-only. Can only view projects and track progress.

---

## 2. Technology Stack

### Frontend
- **React 19** — Component-based UI library
- **Vite 7** — Build tool and dev server
- **React Router DOM 7** — Client-side page routing
- **Axios** — HTTP client for API calls
- **React Icons** — Icon library (using `ri` — Remix Icons set)
- **Plain CSS** with CSS custom properties (variables) — no Tailwind, no CSS frameworks

### Backend
- **Node.js** — JavaScript runtime
- **Express.js 4** — Web framework for REST API
- **Supabase JS Client** — Database queries and auth
- **dotenv** — Environment variable management
- **cors** — Cross-origin request handling
- **cookie-parser** — Reading HTTP cookies for refresh tokens

### Database & Auth
- **Supabase** — Hosted PostgreSQL database + built-in authentication service

### Dev Tools
- **Nodemon** — Auto-restart backend on file changes
- **Concurrently** — Run frontend + backend with one command

---

## 3. Architecture

```
Frontend (React + Vite, port 5173)
    │
    ├── Pages (Login, Dashboard, Projects, Profile)
    ├── Components (Sidebar, StatusBadge, Toast, Modal, etc.)
    ├── API Layer (Axios instance with auth interceptors)
    └── Context (AuthContext, ToastContext)
          │
          │  HTTP requests (Axios → /api/*)
          ▼
Backend (Express.js, port 3000)
    │
    ├── Routes (URL → Controller mapping)
    ├── Middleware (authMiddleware, roleMiddleware)
    ├── Controllers (Business logic)
    └── Config (Supabase client)
          │
          │  Supabase JS Client
          ▼
Supabase (Cloud)
    ├── PostgreSQL Database (profiles, projects, tasks)
    └── Auth Service (user registration, login, JWT tokens)
```

### Data Flow Example: "View All Projects"
1. User clicks "Projects" in sidebar
2. `ProjectList.jsx` mounts → calls `projectApi.getAll()`
3. `axios.js` interceptor attaches JWT token to Authorization header
4. Express receives `GET /api/projects`
5. `authMiddleware.js` verifies the JWT token
6. `projectController.getAll()` queries Supabase: `SELECT * FROM projects`
7. Data returns: Controller → Route → Axios → React state → Rendered list

---

## 4. Folder Structure

```
project-tracker/
│
├── backend/
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── src/
│   ├── api/
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── dashboardApi.js
│   │   ├── projectApi.js
│   │   └── taskApi.js
│   ├── components/
│   │   └── common/
│   │       ├── ConfirmModal.jsx / .css
│   │       ├── EmptyState.jsx / .css
│   │       ├── LoadingSpinner.jsx / .css
│   │       ├── ProtectedRoute.jsx
│   │       ├── Sidebar.jsx / .css
│   │       ├── StatusBadge.jsx / .css
│   │       └── Toast.jsx / .css
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── Login.jsx
│   │   │   └── Login.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── Projects/
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   └── Projects.css
│   │   └── Profile/
│   │       ├── Profile.jsx
│   │       └── Profile.css
│   ├── styles/
│   │   └── variables.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── public/
│   └── favicon.svg
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 5. Database Schema

### Prerequisites: Supabase Project Setup
1. Go to https://supabase.com → Create a new project
2. Note down: Project URL, anon (public) key, and service_role key
3. Go to SQL Editor in the Supabase dashboard and run the SQL below

### Complete SQL Schema

```sql
-- ============================================
-- PROJECT TRACKER — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('project_manager', 'app_support', 'dept_manager')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  start_date DATE,
  end_date DATE,
  smartsheet_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AUTO-CREATE PROFILE ON USER SIGNUP
-- This trigger automatically creates a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'app_support')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- NOTE: this trigger fires as the supabase_auth_admin role, whose search_path
-- does not include "public" by default. Schema-qualifying profiles as
-- public.profiles (and pinning search_path on the function) avoids a
-- "relation profiles does not exist" error on every signup.

-- Drop the trigger if it already exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. AUTO-UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow the service_role key (our backend) to bypass RLS
-- The backend uses the service_role key, so it has full access.
-- These policies allow authenticated users to read data (for any direct Supabase client usage).
CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to tasks"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
```

### Migration: Smartsheet Link Field
Added after the initial schema so PM/App Support can attach the Smartsheet form/sheet a
project is automated with. If your `projects` table already exists (i.e. you ran the
schema above before this field was added), run this once in the SQL Editor:

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS smartsheet_url TEXT;
```

Nullable/optional — not every project needs one.

### Seed Data (Test Users)
After running the schema, create test users via Supabase Auth dashboard:
1. Go to Authentication → Users → "Add user"
2. Create three users:

| Email | Password | full_name (in metadata) | role (in metadata) |
|---|---|---|---|
| pm@tracker.com | password123 | Juan Dela Cruz | project_manager |
| support@tracker.com | password123 | Maria Santos | app_support |
| manager@tracker.com | password123 | Pedro Reyes | dept_manager |

When creating each user in the Supabase dashboard, add the metadata JSON:
```json
{
  "full_name": "Juan Dela Cruz",
  "role": "project_manager"
}
```
The trigger will auto-create the corresponding profile row.

---

## 6. Authentication Flow

```
LOGIN FLOW:
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  React   │  ─────────────────────────►   │ Express  │
│  Login   │  { email, password }          │ Backend  │
│  Page    │                               │          │
│          │  ◄─────────────────────────   │          │
│          │  { access_token, user }        │          │
│          │  + Set-Cookie: refresh_token   │          │
└──────────┘                               └──────────┘
     │                                          │
     │ Store access_token in memory             │ Supabase auth.signInWithPassword()
     │ (React state / context)                  │ Returns access + refresh tokens
     │                                          │ Set refresh_token as HttpOnly cookie
     ▼                                          ▼

SUBSEQUENT API CALLS:
┌──────────┐     GET /api/projects            ┌──────────┐
│  React   │  ─────────────────────────►      │ Express  │
│  Page    │  Header: Authorization:          │ Backend  │
│          │  Bearer <access_token>           │          │
│          │                                  │          │
│          │  ◄─────────────────────────      │          │
│          │  { projects: [...] }             │          │
└──────────┘                                  └──────────┘
                                                   │
                                                   │ authMiddleware verifies JWT
                                                   │ Then controller queries Supabase
                                                   ▼

TOKEN REFRESH:
┌──────────┐     POST /api/auth/refresh       ┌──────────┐
│  Axios   │  ─────────────────────────►      │ Express  │
│ Intercep │  Cookie: refresh_token           │ Backend  │
│  (auto)  │                                  │          │
│          │  ◄─────────────────────────      │          │
│          │  { access_token (new) }          │          │
└──────────┘                                  └──────────┘
```

### Key Decisions:
- **Access token** stored in React memory (not localStorage — slightly more secure)
- **Refresh token** stored as HttpOnly cookie (not accessible via JavaScript)
- **Axios interceptor** auto-attaches the access token to every request
- **401 interceptor** auto-attempts token refresh when access token expires, then retries the failed request
- No MFA, no forced password reset — keep it simple

---

## 7. API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login with email + password |
| POST | `/api/auth/logout` | Yes | Clear refresh cookie, end session |
| POST | `/api/auth/refresh` | Cookie | Exchange refresh token for new access token |
| GET | `/api/auth/me` | Yes | Get current user's profile info |

### Project Routes (`/api/projects`)
| Method | Endpoint | Auth | Roles Allowed | Description |
|---|---|---|---|---|
| GET | `/api/projects` | Yes | All | List all projects (with optional search/filter) |
| GET | `/api/projects/:id` | Yes | All | Get single project with its tasks |
| POST | `/api/projects` | Yes | project_manager | Create a new project |
| PUT | `/api/projects/:id` | Yes | project_manager | Update project details |
| DELETE | `/api/projects/:id` | Yes | project_manager | Delete a project |

### Task Routes (`/api/projects/:projectId/tasks` and `/api/tasks`)
| Method | Endpoint | Auth | Roles Allowed | Description |
|---|---|---|---|---|
| GET | `/api/projects/:projectId/tasks` | Yes | All | List tasks for a project |
| POST | `/api/projects/:projectId/tasks` | Yes | project_manager, app_support | Create/assign a task |
| PUT | `/api/tasks/:id` | Yes | project_manager, app_support | Update task (status, details) |
| DELETE | `/api/tasks/:id` | Yes | project_manager, app_support | Delete a task |

### Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Auth | Roles Allowed | Description |
|---|---|---|---|---|
| GET | `/api/dashboard/stats` | Yes | All | Get aggregate counts and stats |

### User Routes (`/api/users`)
| Method | Endpoint | Auth | Roles Allowed | Description |
|---|---|---|---|---|
| GET | `/api/users` | Yes | project_manager, app_support | List all users (for assignment dropdowns) |

---

## 8. Role Permissions Matrix

### Backend Middleware Implementation

```
requireAuth         → Verifies JWT. Blocks if no valid token.
requireRole(...roles) → Checks user's role from profile. Blocks if not in allowed list.
```

### Permissions Per Feature

| Feature | project_manager | app_support | dept_manager |
|---|---|---|---|
| View Dashboard | ✔ | ✔ | ✔ |
| View Project List | ✔ | ✔ | ✔ |
| View Project Detail | ✔ | ✔ | ✔ |
| Create Project | ✔ | ✘ | ✘ |
| Edit Project | ✔ | ✘ | ✘ |
| Delete Project | ✔ | ✘ | ✘ |
| Create/Assign Task | ✔ | ✔ | ✘ |
| Edit Task | ✔ | ✔ | ✘ |
| Delete Task | ✔ | ✔ | ✘ |
| Update Task Status | ✔ | ✔ | ✘ |
| View Users List | ✔ | ✔ | ✘ |
| View Own Profile | ✔ | ✔ | ✔ |

### Frontend Role Gating
- Hide "New Project" button for non-project_manager roles
- Hide "Edit" / "Delete" buttons on projects for non-project_manager roles
- Hide "Add Task" / task action buttons for dept_manager role
- Use the `AuthContext` to access `user.role` and conditionally render UI elements

---

## 9. Page Specifications

### 9.1 Login Page (`/login`)

**Purpose:** Authenticate users with email and password.

**Layout:**
- Centered card on a light background
- App logo/title at top: "Project Tracker"
- Email input field
- Password input field (with show/hide toggle)
- "Sign In" button (full-width, primary color)
- Error message area (red text below form)

**Behavior:**
- On submit: call `POST /api/auth/login`
- On success: redirect to `/dashboard`
- On error: show error message (e.g., "Invalid email or password")
- Disable button while loading, show spinner

**Validation:**
- Email: required, must be valid email format
- Password: required, minimum 6 characters

---

### 9.2 Dashboard Page (`/dashboard`)

**Purpose:** At-a-glance summary of all project and task activity.

**Layout:**
- Page title: "Dashboard"
- Welcome message: "Welcome back, {user.full_name}!"
- 4 Summary cards in a row:
  - Total Projects (with icon)
  - Active Projects (in_progress status)
  - Completed Projects
  - Total Tasks
- Recent Projects section: table showing last 5 projects (name, status badge, created date)
- Each project row is clickable → navigates to `/projects/:id`

**API:** `GET /api/dashboard/stats`

**Response shape:**
```json
{
  "totalProjects": 12,
  "activeProjects": 5,
  "completedProjects": 3,
  "totalTasks": 45,
  "recentProjects": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "status": "in_progress",
      "priority": "high",
      "created_at": "2025-06-01T..."
    }
  ]
}
```

---

### 9.3 Project List Page (`/projects`)

**Purpose:** Browse all projects with search and filter capabilities.

**Layout:**
- Page title: "Projects"
- Top bar:
  - Search input (searches by project name)
  - Status filter dropdown: All, Not Started, In Progress, Completed, On Hold
  - Priority filter dropdown: All, Low, Medium, High
  - "+ New Project" button (visible only to project_manager)
- Projects table with columns:
  - Project Name
  - Status (as colored badge)
  - Priority (as colored badge)
  - Start Date
  - End Date
  - Created By (name)
  - Actions (View, Edit, Delete — role-dependent)
- Empty state: "No projects found. Create your first project!" (with illustration)
- Pagination (if more than 10 projects)

**Behavior:**
- Search: filters as user types (debounced, 300ms)
- Clicking a project name or "View" → `/projects/:id`
- "Edit" → `/projects/:id/edit` (PM only)
- "Delete" → Confirm modal → `DELETE /api/projects/:id` (PM only)

---

### 9.4 Project Detail Page (`/projects/:id`)

**Purpose:** View a single project's details, task list, and progress.

**Layout:**
- Back button: "← Back to Projects"
- Project header card:
  - Project name (large)
  - Status badge + Priority badge
  - Description
  - Start Date — End Date
  - Created by: {name}
- Progress section:
  - Progress bar (% of tasks completed)
  - Text: "X of Y tasks completed"
- Task list section:
  - Section title: "Tasks"
  - "+ Add Task" button (visible to PM and App Support)
  - Task table with columns:
    - Task Title
    - Status (badge)
    - Priority (badge)
    - Assigned To (name)
    - Due Date
    - Actions (Edit, Delete — PM and App Support only)
  - Empty state for tasks: "No tasks yet. Add your first task!"
- Edit Project button (PM only, top-right) → `/projects/:id/edit`
- Delete Project button (PM only, styled as danger)

**Modals on this page:**
- "Add Task" modal (form with: title, description, status, priority, assigned_to dropdown, due_date)
- "Edit Task" modal (same form, pre-filled)
- "Delete Task" confirmation modal
- "Delete Project" confirmation modal

---

### 9.5 Project Form Page (`/projects/new` and `/projects/:id/edit`)

**Purpose:** Create a new project or edit an existing one.

**Layout:**
- Page title: "Create New Project" or "Edit Project"
- Form fields:
  - Project Name (text input, required, max 100 chars)
  - Description (textarea, optional, max 500 chars)
  - Status (dropdown: Not Started, In Progress, Completed, On Hold)
    - Default for new: "Not Started"
  - Priority (dropdown: Low, Medium, High)
    - Default for new: "Medium"
  - Start Date (date picker)
  - End Date (date picker)
- Buttons:
  - "Create Project" or "Save Changes" (primary)
  - "Cancel" (secondary) → go back to project list

**Validation:**
- Name: required
- End Date: must be after Start Date (if both provided)
- Show inline validation errors

---

### 9.6 Profile Page (`/profile`)

**Purpose:** View the logged-in user's account information.

**Layout:**
- Page title: "My Profile"
- Profile card:
  - Avatar placeholder (initials in a circle)
  - Full Name
  - Email
  - Role (displayed as readable text: "Project Manager", "App Support", "Department Manager")
  - Account Status (Active/Inactive badge)
  - Member since: {created_at formatted}

**Note:** This is read-only. No edit functionality needed for this simple app.

---

## 10. Component Specifications

### 10.1 Sidebar (`Sidebar.jsx`)
- Fixed left sidebar, 250px wide
- App logo/title at top
- Navigation links with icons:
  - Dashboard → `/dashboard`
  - Projects → `/projects`
  - Profile → `/profile`
- Active link highlighted (different background color)
- Logout button at bottom with icon
- On mobile/tablet: collapsible hamburger menu

### 10.2 StatusBadge (`StatusBadge.jsx`)
- Small colored pill/chip displaying a status
- Props: `status` (string), `type` ("project" or "task" or "priority")
- Color mappings:
  - Project/Task status: not_started=gray, to_do=gray, in_progress=blue, completed=green, on_hold=orange
  - Priority: low=gray, medium=yellow, high=red

### 10.3 ConfirmModal (`ConfirmModal.jsx`)
- Overlay modal with centered card
- Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `confirmVariant` (danger/primary)
- "Cancel" and "Confirm" buttons
- Click outside or press Escape to close

### 10.4 Toast (`Toast.jsx`)
- Temporary notification banner (top-right)
- Types: success (green), error (red), warning (orange), info (blue)
- Auto-dismisses after 4 seconds
- Managed by ToastContext

### 10.5 EmptyState (`EmptyState.jsx`)
- Centered placeholder for empty lists
- Props: `icon`, `title`, `message`, `actionLabel`, `onAction`
- Example: clipboard icon + "No projects yet" + "Create your first project!" + button

### 10.6 LoadingSpinner (`LoadingSpinner.jsx`)
- Centered CSS spinner animation
- Props: `fullScreen` (boolean) — if true, covers entire page
- Used while data is loading from API

### 10.7 ProtectedRoute (`ProtectedRoute.jsx`)
- Wrapper component that checks AuthContext
- If not authenticated → redirect to `/login`
- If authenticated → render children
- Optional `allowedRoles` prop → redirect to `/dashboard` if user's role not in list

---

## 11. UI/UX Design System

### Color Palette
```css
:root {
  /* Primary */
  --color-primary: #4F46E5;         /* Indigo — buttons, active links, highlights */
  --color-primary-hover: #4338CA;   /* Darker indigo for hover states */
  --color-primary-light: #EEF2FF;   /* Very light indigo for backgrounds */

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-gray-50: #F9FAFB;        /* Page background */
  --color-gray-100: #F3F4F6;       /* Card backgrounds, input backgrounds */
  --color-gray-200: #E5E7EB;       /* Borders, dividers */
  --color-gray-300: #D1D5DB;       /* Disabled states */
  --color-gray-500: #6B7280;       /* Secondary text, placeholders */
  --color-gray-700: #374151;       /* Primary text */
  --color-gray-900: #111827;       /* Headings */

  /* Status Colors */
  --color-success: #10B981;         /* Green — completed, success toasts */
  --color-warning: #F59E0B;         /* Amber — on hold, warning toasts */
  --color-danger: #EF4444;          /* Red — high priority, error toasts, delete buttons */
  --color-info: #3B82F6;            /* Blue — in progress, info toasts */

  /* Status Badge Backgrounds (lighter versions) */
  --badge-success-bg: #D1FAE5;
  --badge-warning-bg: #FEF3C7;
  --badge-danger-bg: #FEE2E2;
  --badge-info-bg: #DBEAFE;
  --badge-neutral-bg: #F3F4F6;

  /* Sidebar */
  --sidebar-bg: #1E1B4B;           /* Dark indigo */
  --sidebar-text: #C7D2FE;         /* Light indigo text */
  --sidebar-active: #4F46E5;       /* Active item background */
  --sidebar-hover: #312E81;        /* Hover item background */
  --sidebar-width: 250px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}
```

### Typography
- Font family: Inter (import from Google Fonts)
- Page titles: 24-30px, font-weight 700, color gray-900
- Section titles: 18-20px, font-weight 600, color gray-900
- Body text: 14-16px, font-weight 400, color gray-700
- Secondary text: 14px, font-weight 400, color gray-500
- Labels: 14px, font-weight 500, color gray-700

### Button Styles
- **Primary:** bg primary, white text, rounded-md, padding 10px 20px
- **Secondary:** bg white, gray-700 text, border gray-200, rounded-md
- **Danger:** bg danger, white text, rounded-md
- **Ghost:** no bg, primary text, no border (for subtle actions)
- All buttons: cursor pointer, transition on hover, disabled state (opacity 0.5, no pointer)

### Form Inputs
- Border: 1px solid gray-200
- Border-radius: radius-sm
- Padding: 10px 14px
- Font-size: 14px
- Focus: border-color primary, box-shadow 0 0 0 3px primary-light
- Error: border-color danger, error text below

### Card Style
- Background: white
- Border: 1px solid gray-200
- Border-radius: radius-lg
- Padding: space-lg
- Shadow: shadow-sm
- Hover (if clickable): shadow-md, translateY(-1px)

### Table Style
- Header: bg gray-50, font-weight 600, uppercase text xs, gray-500
- Rows: border-bottom gray-200, padding space-md
- Hover row: bg gray-50
- Responsive: horizontal scroll on small screens

---

## 12. Development Phases & Claude Code Prompts

Below are the exact prompts to feed to Claude Code in VS Code, one phase at a time.

---

### PHASE 1: Project Initialization

```
PROMPT FOR CLAUDE CODE:

I need you to initialize a full-stack web application called "Project Tracker" in the current directory. This is a simple CRUD app for an OJT academic project.

TECH STACK:
- Frontend: React 19 + Vite + React Router DOM + Axios + React Icons
- Backend: Express.js 4 + Supabase JS + dotenv + cors + cookie-parser
- Dev tools: Nodemon, Concurrently

STEPS:
1. Initialize the Vite + React project in the current directory (use: npm create vite@latest . -- --template react)
2. Install frontend dependencies: react-router-dom, axios, react-icons
3. Create the backend/ folder
4. Initialize backend/package.json
5. Install backend dependencies: express, @supabase/supabase-js, dotenv, cors, cookie-parser
6. Install backend dev dependencies: nodemon
7. Install root dev dependency: concurrently
8. Configure vite.config.js to proxy /api requests to localhost:3000
9. Add these scripts to root package.json:
   - "dev": "vite" (frontend only)
   - "dev:all": "concurrently -n FRONTEND,BACKEND -c blue,green \"npm run dev\" \"npm --prefix backend run dev\""
10. Add these scripts to backend/package.json:
    - "start": "node server.js"
    - "dev": "nodemon server.js"
11. Create the complete folder structure (empty files are fine for now):
    - backend/config/
    - backend/controllers/
    - backend/middleware/
    - backend/routes/
    - src/api/
    - src/components/common/
    - src/context/
    - src/pages/Login/
    - src/pages/Dashboard/
    - src/pages/Projects/
    - src/pages/Profile/
    - src/styles/
12. Create .env.example files for both root and backend with placeholder keys:
    Root .env: VITE_API_URL=http://localhost:3000/api
    Backend .env: PORT=3000, SUPABASE_URL=your_supabase_url, SUPABASE_SERVICE_ROLE_KEY=your_service_role_key, SUPABASE_ANON_KEY=your_anon_key, CLIENT_URL=http://localhost:5173
13. Create .gitignore covering: node_modules, .env, dist, .vscode
14. Create a basic backend/server.js that starts Express on port 3000 with cors, json parsing, cookie-parser, and a health check route GET /health returning { status: 'ok' }
15. Verify both servers start: frontend on 5173, backend on 3000

DO NOT set up Supabase tables or write any application code yet. Just the skeleton.
```

---

### PHASE 2: Backend Foundation (Config + Auth Middleware)

```
PROMPT FOR CLAUDE CODE:

Now set up the backend foundation for the Project Tracker. We use Supabase for database and auth.

My Supabase credentials are in backend/.env (I've filled them in already).

STEP 1 — Supabase Client Config
Create backend/config/supabaseClient.js:
- Import createClient from @supabase/supabase-js
- Read SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from process.env
- Create and export the supabase client
- Keep it simple, no retry logic needed

STEP 2 — Auth Middleware
Create backend/middleware/authMiddleware.js:
- Export a function: requireAuth(req, res, next)
- Read the Authorization header (expect "Bearer <token>")
- If missing, return 401 { error: "No token provided" }
- Use supabase.auth.getUser(token) to verify the token
- If invalid, return 401 { error: "Invalid or expired token" }
- If valid, fetch the user's profile from the profiles table using the user's id
- Attach to req.user: { id, email, full_name, role, status }
- If profile not found or status !== 'active', return 403
- Call next()

STEP 3 — Role Middleware
Create backend/middleware/roleMiddleware.js:
- Export a function: requireRole(...allowedRoles)
- Returns a middleware that checks req.user.role against allowedRoles
- If not in list, return 403 { error: "Insufficient permissions" }
- Otherwise call next()

STEP 4 — Update server.js
- Import the supabase client (verify connection on startup by logging a message)
- Add a placeholder comment for where routes will be mounted
- Add a basic global error handler at the bottom

The profiles table already exists in Supabase (I ran the SQL schema). Do NOT create any routes or controllers yet.
```

---

### PHASE 3: Authentication (Backend Routes + Frontend Login)

```
PROMPT FOR CLAUDE CODE:

Build the complete authentication flow for the Project Tracker.

BACKEND — Auth Controller + Routes

Create backend/controllers/authController.js with these functions:

1. login(req, res)
   - Receive { email, password } from req.body
   - Call supabase.auth.signInWithPassword({ email, password })
   - If error, return 401 { error: "Invalid email or password" }
   - Fetch the user's profile from profiles table
   - Set the refresh token as an HttpOnly cookie: res.cookie('refresh_token', session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' })
   - Return { access_token: session.access_token, user: { id, full_name, email, role } }

2. logout(req, res)
   - Clear the refresh_token cookie
   - Return { message: "Logged out" }

3. refresh(req, res)
   - Read refresh_token from req.cookies
   - If missing, return 401
   - Call supabase.auth.refreshSession({ refresh_token })
   - If error, clear the cookie and return 401
   - Set the new refresh token cookie
   - Return { access_token: newSession.access_token }

4. getMe(req, res)
   - req.user is already populated by authMiddleware
   - Return { user: req.user }

Create backend/routes/authRoutes.js:
- POST /login → authController.login (no auth required)
- POST /logout → authController.logout (no auth required, just clears cookie)
- POST /refresh → authController.refresh (no auth required, uses cookie)
- GET /me → requireAuth, authController.getMe

Mount in server.js: app.use('/api/auth', authRoutes)

FRONTEND — Axios Setup

Create src/api/axios.js:
- Create an axios instance with baseURL from import.meta.env.VITE_API_URL (fallback: '/api')
- Keep the access token in a module-level variable (let accessToken = null)
- Export setAccessToken(token) and getAccessToken()
- Request interceptor: attach Authorization header if accessToken exists
- Response interceptor: on 401, try POST /auth/refresh (with credentials: true), update accessToken, retry the original request. If refresh also fails, clear token and redirect to /login
- Export the axios instance as default

Create src/api/authApi.js:
- login(email, password): POST /auth/login, with { withCredentials: true }
- logout(): POST /auth/logout, with { withCredentials: true }
- getMe(): GET /auth/me

FRONTEND — Auth Context

Create src/context/AuthContext.jsx:
- AuthProvider wraps the app
- State: user (null or object), loading (true initially)
- On mount: try to call refresh + getMe to restore session
- Provide: user, loading, login(email, password), logout()
- login: calls authApi.login, sets token, sets user
- logout: calls authApi.logout, clears token, clears user, navigate to /login

FRONTEND — Login Page

Create src/pages/Login/Login.jsx and Login.css:
- Centered card design on gray-50 background
- App title "Project Tracker" with a small icon
- Email input + Password input
- "Sign In" button (full width, primary color)
- Show error message if login fails
- Show loading spinner on button while submitting
- On success: redirect to /dashboard
- Use the AuthContext's login function
- If already authenticated, redirect to /dashboard

FRONTEND — App.jsx Setup

Update src/App.jsx:
- Wrap everything in AuthProvider
- Set up React Router with these routes:
  - / → redirect to /login
  - /login → Login page
  - /dashboard → placeholder "Dashboard" text (we'll build it next)
  - /projects → placeholder "Projects" text
  - /projects/new → placeholder
  - /projects/:id → placeholder
  - /projects/:id/edit → placeholder
  - /profile → placeholder "Profile" text
- Protected routes should redirect to /login if not authenticated
- Show a full-screen loading spinner while auth is initializing

Create src/styles/variables.css with the FULL CSS design system from the specification (all the CSS custom properties for colors, spacing, typography, shadows, etc.)

Update src/index.css:
- Import variables.css
- Import Inter font from Google Fonts
- Basic reset: box-sizing border-box, margin 0, padding 0
- Body: font-family var(--font-family), bg var(--color-gray-50), color var(--color-gray-700)

IMPORTANT: Make sure the login flow works end-to-end. I should be able to:
1. Start both servers with npm run dev:all
2. See the login page
3. Enter test credentials and get redirected to dashboard
4. Refresh the page and stay logged in (via cookie refresh)
```

---

### PHASE 4: Layout (Sidebar + Toast + Protected Routes)

```
PROMPT FOR CLAUDE CODE:

Build the app layout shell: sidebar navigation, toast notifications, and route protection.

SIDEBAR (src/components/common/Sidebar.jsx + Sidebar.css)
- Fixed left sidebar, 250px wide, full height
- Dark indigo background (var(--sidebar-bg): #1E1B4B)
- Top: App name "Project Tracker" in white, with a small icon (RiDashboardLine or similar from react-icons/ri)
- Navigation links with icons (use react-icons/ri — Remix Icons):
  - Dashboard (RiDashboardLine) → /dashboard
  - Projects (RiFolderLine) → /projects
  - Profile (RiUserLine) → /profile
- Active link: highlighted background (var(--sidebar-active)), white text
- Hover: slightly lighter background (var(--sidebar-hover))
- Bottom: user info section showing user's name and role, plus Logout button (RiLogoutBoxRLine)
- Use React Router's NavLink for active state detection
- Get user info and logout function from AuthContext

TOAST SYSTEM (src/context/ToastContext.jsx + src/components/common/Toast.jsx + Toast.css)
- ToastContext provides: showToast(message, type) where type is 'success' | 'error' | 'warning' | 'info'
- Toast renders in top-right corner, fixed position
- Color-coded by type (green/red/amber/blue using CSS variables)
- Has a close X button
- Auto-dismisses after 4 seconds
- Supports stacking multiple toasts
- Smooth enter/exit animation (slide in from right)

PROTECTED ROUTE (src/components/common/ProtectedRoute.jsx)
- Checks AuthContext: if loading, show LoadingSpinner
- If not authenticated, redirect to /login
- Optional prop: allowedRoles (array of role strings)
  - If provided and user's role not in list, redirect to /dashboard with a toast "You don't have permission to access this page"
- Otherwise, render children

LOADING SPINNER (src/components/common/LoadingSpinner.jsx + LoadingSpinner.css)
- Simple CSS-only spinner (rotating circle border)
- Props: fullScreen (boolean) → centers on page if true

UPDATE App.jsx:
- Wrap routes in ToastProvider
- For authenticated routes: show Sidebar + main content area
- Layout: sidebar on left (fixed), main content takes remaining width with padding
- Use ProtectedRoute for all pages except /login
- Keep /login outside the sidebar layout

UPDATE App.css:
- .app-layout: display flex, min-height 100vh
- .main-content: margin-left var(--sidebar-width), flex 1, padding var(--space-xl)

After this phase, I should be able to:
1. Log in and see the sidebar with navigation links
2. Click between Dashboard/Projects/Profile placeholders
3. See the active link highlighted
4. Log out from the sidebar
5. See toast notifications when triggered
6. Be redirected to login if not authenticated
```

---

### PHASE 5: Dashboard Page

```
PROMPT FOR CLAUDE CODE:

Build the Dashboard page — the home screen after login.

BACKEND

Create backend/controllers/dashboardController.js:
- getStats(req, res):
  - Query Supabase for:
    - Total projects count: SELECT count(*) FROM projects
    - Active projects: SELECT count(*) FROM projects WHERE status = 'in_progress'
    - Completed projects: SELECT count(*) FROM projects WHERE status = 'completed'
    - Total tasks: SELECT count(*) FROM tasks
    - Completed tasks: SELECT count(*) FROM tasks WHERE status = 'completed'
    - Recent 5 projects: SELECT id, name, status, priority, created_at FROM projects ORDER BY created_at DESC LIMIT 5
  - Return all as a JSON object

Create backend/routes/dashboardRoutes.js:
- GET /stats → requireAuth, dashboardController.getStats

Mount in server.js: app.use('/api/dashboard', dashboardRoutes)

FRONTEND

Create src/api/dashboardApi.js:
- getStats(): GET /dashboard/stats

Create src/pages/Dashboard/Dashboard.jsx + Dashboard.css:
- Page title "Dashboard" (h1)
- Welcome message: "Welcome back, {user.full_name}!" (use AuthContext)
- 4 stat cards in a responsive grid (2x2 on mobile, 4 in a row on desktop):
  1. "Total Projects" — icon RiFolderLine, count, primary color accent
  2. "Active" — icon RiTimeLine, count, blue accent
  3. "Completed" — icon RiCheckDoubleLine, count, green accent
  4. "Total Tasks" — icon RiTaskLine, count, indigo accent
- Each stat card: white background, rounded-lg, shadow-sm, left colored border (4px), icon + number (large) + label below
- Below the cards: "Recent Projects" section
  - If no projects: EmptyState component ("No projects yet")
  - If projects exist: a simple table with columns: Name, Status (badge), Priority (badge), Created
  - Clicking a row navigates to /projects/:id
- Show LoadingSpinner while data is fetching

Also create the StatusBadge component now (src/components/common/StatusBadge.jsx + StatusBadge.css):
- Props: status (string), type ('status' | 'priority')
- Renders a small pill/chip with appropriate background and text color
- Status mappings:
  - not_started / to_do → gray bg, gray text, label "Not Started" / "To Do"
  - in_progress → blue bg, blue text, label "In Progress"
  - completed → green bg, green text, label "Completed"
  - on_hold → amber bg, amber text, label "On Hold"
- Priority mappings:
  - low → gray bg, gray text
  - medium → amber bg, amber text
  - high → red bg, red text
- Display the label in Title Case

Also create the EmptyState component (src/components/common/EmptyState.jsx + EmptyState.css):
- Props: icon (React node), title (string), message (string), actionLabel (string, optional), onAction (function, optional)
- Centered layout with icon, title, message, and optional action button
- Muted colors, friendly appearance
```

---

### PHASE 6: Project CRUD

```
PROMPT FOR CLAUDE CODE:

Build the complete Project CRUD (Create, Read, Update, Delete) functionality.

BACKEND

Create backend/controllers/projectController.js:

1. getAll(req, res)
   - Accept optional query params: search (string), status (string), priority (string)
   - Query: SELECT projects.*, profiles.full_name as creator_name FROM projects LEFT JOIN profiles ON projects.created_by = profiles.id
   - Apply filters if provided (use .ilike for search on name, .eq for status/priority)
   - Order by created_at DESC
   - Return { projects: [...] }

2. getById(req, res)
   - Get project by req.params.id
   - Include creator name via join
   - Also fetch all tasks for this project with assigned user names:
     SELECT tasks.*, profiles.full_name as assignee_name FROM tasks LEFT JOIN profiles ON tasks.assigned_to = profiles.id WHERE project_id = :id ORDER BY created_at DESC
   - Calculate progress: (completed tasks / total tasks) * 100
   - Return { project: {..., tasks: [...], progress: number} }

3. create(req, res)
   - Receive { name, description, status, priority, start_date, end_date }
   - Set created_by to req.user.id
   - Validate: name is required
   - Insert into projects table
   - Return 201 { project: {...} }

4. update(req, res)
   - Receive { name, description, status, priority, start_date, end_date }
   - Update the project where id = req.params.id
   - Return { project: {...} }

5. remove(req, res)
   - Delete the project where id = req.params.id
   - Tasks cascade delete automatically
   - Return { message: "Project deleted" }

Create backend/routes/projectRoutes.js:
- GET / → requireAuth, getAll
- GET /:id → requireAuth, getById
- POST / → requireAuth, requireRole('project_manager'), create
- PUT /:id → requireAuth, requireRole('project_manager'), update
- DELETE /:id → requireAuth, requireRole('project_manager'), remove

Mount: app.use('/api/projects', projectRoutes)

FRONTEND

Create src/api/projectApi.js:
- getAll(params): GET /projects with query params (search, status, priority)
- getById(id): GET /projects/:id
- create(data): POST /projects
- update(id, data): PUT /projects/:id
- remove(id): DELETE /projects/:id

Create src/pages/Projects/ProjectList.jsx:
- Fetch projects on mount using projectApi.getAll()
- Top bar with:
  - Search input (controlled, with debounce — use a 300ms setTimeout)
  - Status filter dropdown (All, Not Started, In Progress, Completed, On Hold)
  - Priority filter dropdown (All, Low, Medium, High)
  - "+ New Project" button (only visible if user.role === 'project_manager') → navigates to /projects/new
- Table with columns: Name (clickable link), Status (StatusBadge), Priority (StatusBadge), Start Date, End Date, Created By, Actions
- Actions column (role-dependent):
  - View (eye icon) → /projects/:id → visible to all
  - Edit (pencil icon) → /projects/:id/edit → PM only
  - Delete (trash icon) → shows ConfirmModal → PM only
- On delete confirmation: call projectApi.remove, show success toast, refresh list
- Loading spinner while fetching
- EmptyState if no projects
- Re-fetch when search/filter changes

Create src/pages/Projects/ProjectForm.jsx:
- Shared form for both Create and Edit
- Determine mode from the URL: /projects/new = create, /projects/:id/edit = edit
- In edit mode: fetch existing project data and pre-fill the form
- Form fields with labels:
  - Project Name (text input, required)
  - Description (textarea)
  - Status (select dropdown) → default "not_started" for new
  - Priority (select dropdown) → default "medium" for new
  - Start Date (date input)
  - End Date (date input)
- Validation:
  - Name required → show "Project name is required" inline error
  - If both dates provided, end_date must be >= start_date
- Submit button: "Create Project" or "Save Changes"
- Cancel button: navigate back to /projects
- On submit success: show toast, navigate to /projects
- On submit error: show error toast

Create src/pages/Projects/ProjectDetail.jsx:
- Fetch project by id (includes tasks and progress)
- Back link: "← Back to Projects" → /projects
- Project header card with: name, status badge, priority badge, description, date range, created by
- Progress section: progress bar (CSS) + "X of Y tasks completed" text
- Task section (we'll build the task CRUD next phase — for now just display the task list if any exist, with EmptyState if none)
- Action buttons for PM only: "Edit Project" and "Delete Project"
- Delete: ConfirmModal → on confirm → delete → toast → navigate to /projects

Also create the ConfirmModal component (src/components/common/ConfirmModal.jsx + ConfirmModal.css):
- Overlay (dark semi-transparent backdrop)
- Centered modal card (max-width 400px)
- Props: isOpen, onClose, onConfirm, title, message, confirmText (default "Confirm"), variant ('danger' | 'primary')
- Warning icon for danger variant
- Cancel and Confirm buttons
- Close on backdrop click or Escape key
- Prevent scroll on body when open

Create src/pages/Projects/Projects.css for all project page styles.

Update the routes in App.jsx to use actual components instead of placeholders:
- /projects → ProjectList
- /projects/new → ProtectedRoute with allowedRoles=['project_manager'] → ProjectForm
- /projects/:id → ProjectDetail
- /projects/:id/edit → ProtectedRoute with allowedRoles=['project_manager'] → ProjectForm
```

---

### PHASE 7: Task CRUD

```
PROMPT FOR CLAUDE CODE:

Build the Task CRUD functionality. Tasks are managed within the ProjectDetail page using modals (no separate pages).

BACKEND

Create backend/controllers/taskController.js:

1. getByProject(req, res)
   - Get all tasks where project_id = req.params.projectId
   - Join with profiles to get assignee_name
   - Order by created_at DESC
   - Return { tasks: [...] }

2. create(req, res)
   - Receive { title, description, status, priority, assigned_to, due_date }
   - Set project_id from req.params.projectId
   - Set created_by to req.user.id
   - Validate: title is required
   - Insert into tasks table
   - Return 201 { task: {...} }

3. update(req, res)
   - Receive { title, description, status, priority, assigned_to, due_date }
   - Update where id = req.params.id
   - Return { task: {...} }

4. remove(req, res)
   - Delete where id = req.params.id
   - Return { message: "Task deleted" }

Create backend/routes/taskRoutes.js:
- GET /project/:projectId → requireAuth, getByProject
- POST /project/:projectId → requireAuth, requireRole('project_manager', 'app_support'), create
- PUT /:id → requireAuth, requireRole('project_manager', 'app_support'), update
- DELETE /:id → requireAuth, requireRole('project_manager', 'app_support'), remove

Create backend/controllers/userController.js:
- getAll(req, res): SELECT id, full_name, email, role FROM profiles WHERE status = 'active' ORDER BY full_name
- Return { users: [...] }

Create backend/routes/userRoutes.js:
- GET / → requireAuth, requireRole('project_manager', 'app_support'), getAll

Mount in server.js:
- app.use('/api/tasks', taskRoutes)
- app.use('/api/users', userRoutes)

FRONTEND

Create src/api/taskApi.js:
- getByProject(projectId): GET /tasks/project/:projectId
- create(projectId, data): POST /tasks/project/:projectId
- update(id, data): PUT /tasks/:id
- remove(id): DELETE /tasks/:id

Add to src/api/ a userApi.js:
- getAll(): GET /users

UPDATE src/pages/Projects/ProjectDetail.jsx to include full task management:

- Add a "+ Add Task" button (visible to PM and App Support only)
- Task table with columns: Title, Status (badge), Priority (badge), Assigned To, Due Date, Actions
- Actions (PM and App Support only):
  - Edit (pencil icon) → opens edit task modal
  - Delete (trash icon) → opens confirm modal
  - Quick status change: dropdown or clickable badge to cycle status (to_do → in_progress → completed)
- Clicking "+ Add Task" opens a TaskModal in "create" mode
- Clicking edit opens TaskModal in "edit" mode (pre-filled)

Create a TaskModal component (can be in src/pages/Projects/TaskModal.jsx):
- Modal overlay + centered card
- Form fields:
  - Title (text input, required)
  - Description (textarea)
  - Status (select: To Do, In Progress, Completed)
  - Priority (select: Low, Medium, High)
  - Assigned To (select dropdown populated from userApi.getAll() — show full_name, value is id)
  - Due Date (date input)
- Submit button: "Add Task" or "Save Changes"
- Cancel button: closes modal
- On success: show toast, close modal, refresh task list

After this phase, the full CRUD loop should work:
1. PM creates a project → adds tasks → assigns to users
2. App Support can add tasks and update their status
3. Dept Manager can only view projects and tasks
4. Deleting a project cascades and removes all its tasks
```

---

### PHASE 8: Profile Page + Polish + Final Fixes

```
PROMPT FOR CLAUDE CODE:

Build the Profile page and polish the entire application.

PROFILE PAGE (src/pages/Profile/Profile.jsx + Profile.css):
- Page title: "My Profile"
- Profile card:
  - Avatar circle with user's initials (first letter of first name + first letter of last name, uppercase)
  - Avatar: 80px circle, indigo background, white text, font-size 2xl
  - Full Name (large text)
  - Email (gray-500 text)
  - Role (displayed as human-readable: "project_manager" → "Project Manager", "app_support" → "App Support", "dept_manager" → "Department Manager")
  - Status badge (Active = green, Inactive = red)
  - Member since: formatted date (e.g., "June 15, 2025")
- This page is read-only

POLISH & IMPROVEMENTS:

1. Responsive Design:
   - Sidebar: on screens < 768px, sidebar collapses to icons only (60px wide) or becomes a hamburger drawer
   - Dashboard stat cards: 1 column on mobile, 2 on tablet, 4 on desktop
   - Tables: horizontal scroll wrapper on small screens
   - Forms: single column on mobile
   - Login card: full width on mobile with padding

2. Loading States:
   - Every page that fetches data should show LoadingSpinner
   - Buttons should show a mini spinner and be disabled while submitting

3. Error Handling:
   - If API call fails, show error toast with a helpful message
   - If a page can't load data, show a "Something went wrong" message with a retry button

4. Empty States:
   - ProjectList with no projects: friendly message + "Create your first project" button (PM only)
   - ProjectDetail with no tasks: friendly message + "Add your first task" button
   - Dashboard with no data: friendly welcome message

5. Date Formatting:
   - All dates displayed as: "Jun 15, 2025" format
   - Use Intl.DateTimeFormat or a simple formatter function

6. Confirmation before destructive actions:
   - Delete project → ConfirmModal with danger variant
   - Delete task → ConfirmModal with danger variant
   - Logout → no confirmation needed (quick action)

7. Page titles:
   - Update document.title on each page (e.g., "Dashboard | Project Tracker")

8. 404 Page:
   - Create a simple NotFound page for unmatched routes
   - "Page not found" + link back to Dashboard

9. Favicon:
   - Create a simple SVG favicon (a folder icon or checkmark in indigo)

10. README.md:
    - Project title and description
    - Tech stack list
    - Setup instructions (Prerequisites, Clone, Install, Environment variables, Run Supabase SQL, Start servers)
    - Default test accounts
    - Folder structure overview
    - Screenshots section (placeholder)

Review the entire codebase for:
- Console errors or warnings
- Unused imports
- Missing error handling
- Inconsistent naming
- CSS issues (overflow, alignment, spacing)
- Make sure every feature works for all three roles
```

---

## Quick Reference: Running the Application

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Set up environment variables
# Copy .env.example to .env in both root and backend/
# Fill in your Supabase credentials

# Run the Supabase SQL schema in the Supabase Dashboard SQL Editor

# Create test users in Supabase Dashboard → Authentication → Users

# Start both servers
npm run dev:all

# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Health check: http://localhost:3000/health
```

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Project Manager | pm@tracker.com | password123 |
| App Support | support@tracker.com | password123 |
| Dept/Estate Manager | manager@tracker.com | password123 |

---

*End of specification. Feed each PHASE prompt to Claude Code sequentially.*
