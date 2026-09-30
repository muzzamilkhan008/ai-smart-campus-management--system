# 🎓 AI Smart Campus Management System

> **Tagline:** "One Smart Platform for the Entire Campus"

A production-quality full-stack AI Smart Campus Management System built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Prisma ORM**, and **SQLite/PostgreSQL**.

---

## 🌟 Key Features & Highlights

- 👑 **Admin Portal:** Manage Students, Teachers, Departments, Course Tracks, Subjects, Timetables, Fee Invoices, Exams, Results, Library, Notices, Events, Documents & Audit Logs.
- 👨‍🏫 **Teacher Portal:** View assigned classes, mark class attendance, create homework assignments, configure exams, enter student marks, and publish announcements.
- 🎓 **Student Portal:** View attendance metrics, enrolled courses, submit assignments, take timed online MCQ tests, calculate GPA, download tuition receipts, and interact with **CampusAI**.
- 🤖 **CampusAI Assistant:** Natural language student assistant integrated with real-time database context (attendance warnings, exam dates, results, fee status, and academic insights).
- 🛡️ **Enterprise Security & RBAC:** Password hashing (`bcryptjs`), JWT session tokens, role authorization middleware, input sanitization, and detailed audit logs.
- 📊 **Executive Analytics & Reporting:** Interactive Recharts visual dashboards, CSV data export, printable fee receipts, and digital result card transcripts.
- 🌙 **Modern Design System:** Dark/Light mode theme switching, responsive sidebar navigation, modal dialogs, loading skeletons, and toast notifications.

---

## 🛠️ Recommended Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, REST API |
| **Database** | SQLite (Local Dev Zero-Setup) / PostgreSQL ready via Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt Password Hashing, RBAC Middleware |

---

## 🔐 Demo Credentials

All test accounts come seeded with pre-populated academic records:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **ADMIN** | `admin@campus.edu` | `admin123` | Complete administrative & system control |
| **TEACHER** | `teacher1@campus.edu` | `password123` | Classes, Attendance, Assignments, Exams |
| **STUDENT** | `student1@campus.edu` | `password123` | Profile, Attendance, Online Exams, GPA, CampusAI |
| **STAFF** | `staff@campus.edu` | `password123` | Registrar & Billing operations |

---

## 🐙 GITHUB SETUP

To initialize Git tracking and prepare the repository for remote hosting:

```bash
# Initialize Git repository
git init

# Stage all project files (ignoring secrets & build artifacts via .gitignore)
git add .

# Create initial commit
git commit -m "Initial AI Smart Campus Management System"
```

*Note: Ensure real secrets, `.env` files, and database files are never committed to version control.*

---

## 🚀 Local Quickstart & Running Instructions

### 1. Backend API Setup

```bash
cd backend
npm install
npx prisma validate
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
npm test
npm run dev
```
*Backend API will run on `http://localhost:5000`.*

### 2. Frontend Application Setup

```bash
cd frontend
npm install
npm run build
npm run dev
```
*Frontend Web App will run on `http://localhost:5173`.*

---

## 🧪 Automated Testing

To execute the backend automated test suite:

```bash
cd backend
npm test
```

---

## 📁 Project Structure

```
ai-smart-campus/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── index.ts
│   ├── tests/
│   │   └── run-tests.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
├── Dockerfile
└── docker-compose.yml
```
