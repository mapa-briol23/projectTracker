# CLAUDE.md

## Project

This is a simple Project Tracker Web Application for an OJT academic project.
Full specification is in PROJECT_TRACKER_SPEC.md — always reference it.

## Tech Stack

- Frontend: React 19 + Vite + React Router DOM 7 + Axios + React Icons (ri set)
- Backend: Express.js 4 + Supabase JS Client
- Database: Supabase (PostgreSQL)
- Styling: Plain CSS with CSS custom properties (no Tailwind)

## Key Rules

- Keep everything simple and beginner-friendly
- Use the exact folder structure from the spec
- Use the CSS design system from Section 11 of the spec (colors, spacing, typography)
- Three roles: project_manager, app_support, dept_manager
- Backend pattern: Routes → Middleware → Controllers → Supabase
- Frontend pattern: Pages → Components → API Layer → Context
- All API calls go through src/api/axios.js (with auth interceptor)
- Access token in memory, refresh token in HttpOnly cookie
- Never install Tailwind, TypeScript, Redux, or any extra framework
- Comment code where necessary for OJT defense explanation

## Commands

- Start both servers: npm run dev:all
- Frontend only: npm run dev (port 5173)
- Backend only: cd backend && npm run dev (port 3000)

## Current Phase

Phase 6 — Project CRUD (complete)
Next: Phase 7 — Task CRUD
(Update this line manually as you complete each phase)
