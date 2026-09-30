# 🚀 Online Deployment Guide — AI Smart Campus Management System

This guide outlines the production deployment preparation and step-by-step instructions for deploying the **AI Smart Campus Management System** across PostgreSQL database hosting, Node.js backend servers, and CDN frontend hosting (e.g., Vercel, Render, Railway, Fly.io, or AWS).

---

## 📋 Required Environment Variables

### Backend (`backend/.env.example`)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your_super_secret_jwt_key_here_2026
PORT=5000
FRONTEND_URL=https://your-campus-frontend-domain.com
GEMINI_API_KEY=your_optional_gemini_api_key
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL=https://your-campus-backend-api-domain.com/api
```

---

## 📋 Exact Deployment Sequence (STEPS 1 – 10)

1. **STEP 1 — PostgreSQL Database Provisioning:** Create PostgreSQL instance on AWS RDS, Supabase, Neon, or Render PostgreSQL.
2. **STEP 2 — Backend Deployment Setup:** Deploy `backend/` to Render, Railway, Fly.io, or AWS EC2/ECS.
3. **STEP 3 — Environment Variables Injection:** Set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, `GEMINI_API_KEY`.
4. **STEP 4 — Prisma Database Setup:** Run `npx prisma generate`, `npx prisma db push`, `npm run prisma:seed`.
5. **STEP 5 — Backend Health Check Verification:** Test `GET /api/health` returns status `OK`.
6. **STEP 6 — Frontend Deployment Setup:** Deploy `frontend/` to Vercel, Netlify, or Cloudflare Pages.
7. **STEP 7 — VITE_API_URL Configuration:** Set `VITE_API_URL` to production backend API domain.
8. **STEP 8 — CORS Configuration Verification:** Ensure backend `FRONTEND_URL` matches frontend domain.
9. **STEP 9 — Login Test:** Authenticate with seeded credentials (`admin@campus.edu`, `teacher1@campus.edu`, `student1@campus.edu`).
10. **STEP 10 — Full E2E Production Test:** Test Student portal, MCQ simulator, Results & CampusAI assistant.

---

## 🛠️ Build & Start Commands

### Backend Production Build
```bash
cd backend
npm ci
npx prisma generate
npm run build
npm start
```

### Frontend Production Build
```bash
cd frontend
npm ci
npm run build
```
*(Deploy `dist/` folder)*

---

## 🏥 Health-Check Endpoint

- **Endpoint:** `GET /api/health`
- **Response Format:**
  ```json
  {
    "status": "OK",
    "message": "AI Smart Campus API is active and healthy."
  }
  ```
