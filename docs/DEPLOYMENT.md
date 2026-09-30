# 🚀 Deployment Guide & Order — AI Smart Campus Management System

This document details the exact 10-step production deployment sequence for releasing the **AI Smart Campus Management System** across PostgreSQL database services, Node.js backend servers, and frontend CDN hosting.

---

## 📋 Exact Deployment Order (STEPS 1 – 10)

### STEP 1 — PostgreSQL Database Provisioning
- Provision a production PostgreSQL instance on AWS RDS, Supabase, Neon, or Render PostgreSQL.
- Obtain the database connection string:
  `postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public`

### STEP 2 — Backend Deployment Setup
- Deploy the backend codebase to Render, Railway, Fly.io, or AWS EC2/ECS.
- Set build command: `npm ci && npx prisma generate && npm run build`
- Set start command: `npm start` *(runs compiled JS from `dist/index.js`)*

### STEP 3 — Environment Variables Injection
Configure production variables on backend host:
```env
PORT=5000 # Dynamic port assigned by host
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your_production_secure_jwt_key_64_chars
NODE_ENV=production
FRONTEND_URL=https://smartcampus.edu
GEMINI_API_KEY=optional_gemini_key
```

### STEP 4 — Prisma Database Schema & Migration Setup
Run production database push and demo seeding:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### STEP 5 — Backend Health Check Verification
- Request: `GET https://api.smartcampus.edu/api/health`
- Expected Response:
  ```json
  {
    "status": "OK",
    "message": "AI Smart Campus API is active and healthy."
  }
  ```

### STEP 6 — Frontend Deployment Setup
- Deploy `frontend/` codebase to Vercel, Netlify, or Cloudflare Pages.
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

### STEP 7 — VITE_API_URL Configuration
Set build variable on frontend host:
```env
VITE_API_URL=https://api.smartcampus.edu/api
```
*(Ensures Vite production bundle calls production backend API without hardcoded localhost dependencies)*.

### STEP 8 — CORS Configuration Verification
Verify that backend `FRONTEND_URL` matches frontend domain (`https://smartcampus.edu`) to allow cross-origin API credentials while rejecting unauthorized origins.

### STEP 9 — Production Login Verification
Access `https://smartcampus.edu/login` and test authentication with seeded accounts (`admin@campus.edu`, `teacher1@campus.edu`, `student1@campus.edu`).

### STEP 10 — Full E2E Production Test
Verify Student dashboard, Timed Online MCQ Exam Simulator, Grade Transcript, Fee Receipt generation, and CampusAI contextual query engine.
