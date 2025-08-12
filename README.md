# Snake & Ladder Trial — Next.js + Node/Prisma (Railway)

## Overview
Monorepo with Next.js frontend and Node/Express + Prisma backend. Deployed to Railway as two services.

## Stack
- Frontend: Next.js, React, Tailwind
- Backend: Node 18, Express, Prisma
- DB: PostgreSQL (Railway)

## Structure
frontend/
backend/

## Local Dev
### Backend
1) `cp backend/.env.example backend/.env` (or create) → set `DATABASE_URL=...`
2) `cd backend && npm i`
3) `npx prisma db push` (or `prisma migrate dev`)
4) `npm run dev`

### Frontend
1) `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3000`
2) `cd frontend && npm i`
3) `npm run dev`

## Deploy (Railway)
Create two services from the same repo with root dirs `backend` and `frontend`.  
Set env vars: backend `DATABASE_URL`, frontend `NEXT_PUBLIC_API_URL` (backend URL).
