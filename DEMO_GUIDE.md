# 🎓 AI Smart Campus Management System — Official Demo & Presentation Guide

> **Tagline:** *"One Smart Platform for the Entire Campus"*

---

## 📌 1. Project Overview & Objective

The **AI Smart Campus Management System** is a production-grade full-stack university software platform. It provides centralized digital administration for higher education institutions, connecting administrators, faculty members, students, and registrar staff into one unified real-time ecosystem powered by **CampusAI**.

### Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, TypeScript, REST API
- **Database & ORM:** SQLite (Zero-setup local execution) / PostgreSQL ready via Prisma ORM
- **Authentication & Security:** JWT (JSON Web Tokens), Bcrypt password hashing, RBAC Middleware, Audit Logs

---

## 🔐 2. Demo Credentials

Use these seeded accounts for live classroom demonstrations:

| Role | Email | Password | Primary Demo Scope |
|---|---|---|---|
| 👑 **ADMIN** | `admin@campus.edu` | `admin123` | Full Campus Executive Control & Reports |
| 👨‍🏫 **TEACHER** | `teacher1@campus.edu` | `password123` | Class Attendance, Assignments & Exam Grading |
| 🎓 **STUDENT** | `student1@campus.edu` | `password123` | Student Dashboard, Online Exams, GPA & CampusAI |
| 💼 **STAFF** | `staff@campus.edu` | `password123` | Registrar & Tuition Billing Receipts |

---

## 🚀 3. How to Start the Live Application

### Step 1: Start Backend API (Port 5000)

```bash
cd backend
npm install
npx prisma validate
npx prisma generate
npx prisma db push
npm run prisma:seed
npm test
npm run dev
```

### Step 2: Start Frontend Web App (Port 5173)

```bash
cd frontend
npm install
npm run build
npm run dev
```

- **Backend API Health Check:** `http://localhost:5000/api/health`
- **Frontend App Portal:** `http://localhost:5173`

---

## 👑 4. Admin Presentation Flow (3 Minutes)

1. **Login:** Navigate to `http://localhost:5173/login`, click the **👑 Admin** quick button, and sign in.
2. **Executive Dashboard (`/admin/dashboard`):** Show total enrolled students (30), faculty (5), active courses (10), departments (4), campus attendance rate (93.4%), tuition collected ($125,000), and Recharts enrollment growth charts.
3. **Student Management (`/admin/students`):** Demonstrate search by name/email, department filtering, adding a new student, exporting CSV data, and opening the multi-tab student profile drawer.
4. **Faculty Management (`/admin/teachers`):** Demonstrate faculty listing and department assignments.
5. **Academic Departments & Courses (`/admin/departments`, `/admin/courses`):** Show academic department tracks (CS, EE, ME, BUS) and subject credit hour allocations.
6. **Billing & Fees (`/admin/fees`):** Show fee invoices, recording payments, and generating financial receipts.
7. **Reports & Audit Logs (`/admin/reports`, `/admin/users`):** View executive summaries and security audit trails.

---

## 👨‍🏫 5. Teacher Presentation Flow (2 Minutes)

1. **Login:** Sign out and log in using **👨‍🏫 Teacher** (`teacher1@campus.edu` / `password123`).
2. **Faculty Dashboard (`/teacher/dashboard`):** View assigned teaching subjects (Data Structures & AI).
3. **Mark Class Attendance (`/teacher/attendance`):** Select subject, select date, mark Present/Absent/Late status for students, and save to trigger compliance notifications for students falling below 75%.
4. **Assignments & Grading (`/teacher/assignments`):** Create new homework assignments and review student code submissions.

---

## 🎓 6. Student Presentation Flow & CampusAI (2 Minutes)

1. **Login:** Log in using **🎓 Student** (`student1@campus.edu` / `password123`).
2. **Student Dashboard (`/student/dashboard`):** View attendance rate (92.5%), CGPA (3.75), enrolled courses, and upcoming exams.
3. **Online MCQ Exam Simulator (`/student/exams`):** Start the timed online MCQ test, select answers, submit, and view instant auto-graded score card.
4. **Results & GPA Calculator (`/student/results`):** View official digital transcript card and simulate semester GPA changes with the interactive calculator.
5. **Tuition Fee Receipts (`/student/fees`):** View invoice status and generate printable payment receipts.
6. **CampusAI Assistant (`/student/campus-ai`):** Ask factual queries:
   - *"What is my attendance?"*
   - *"When is my next exam?"*
   - *"What are my latest results?"*
   - *"What fees are pending?"*
   *Demonstrate that responses fetch real database records while maintaining privacy.*

---

## 🧪 7. Automated Test Verification Results

```
🧪 Running AI Smart Campus Comprehensive End-to-End Workflow Test Suite...

  ✅ PASS: GET /api/health endpoint active (Status: OK)
  ✅ PASS: ADMIN Login (admin@campus.edu) succeeds
  ✅ PASS: TEACHER Login (teacher1@campus.edu) succeeds
  ✅ PASS: STUDENT Login (student1@campus.edu) succeeds
  ✅ PASS: RBAC prevents student token from reaching Admin-only /api/users (403 Forbidden)
  ✅ PASS: Admin Workflow: Created Department (DATA)
  ✅ PASS: Admin Workflow: Created Student record
  ✅ PASS: Teacher Workflow: Marked class attendance for students
  ✅ PASS: Teacher Workflow: Created Assignment
  ✅ PASS: Student Workflow: Submitted assignment solution
  ✅ PASS: Admin Workflow: Generated Fee Invoice
  ✅ PASS: Student Workflow: Processed Fee Payment & Generated Receipt
  ✅ PASS: CampusAI Engine: Fetched factual attendance database response
  ✅ PASS: Consolidated Reports: Generated campus summary statistics

📊 E2E Workflow Verification Summary: 14 Passed, 0 Failed
🎉 All Full-Stack End-to-End Workflows PASSED Cleanly!
```
