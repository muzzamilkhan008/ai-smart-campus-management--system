# 🏗️ Architecture Documentation — AI Smart Campus Management System

## 1. System Architecture Overview

The system is structured as a decoupled Full-Stack Web Application following clean architecture principles:

```
[ React 18 + TS Frontend ] <--- REST API (JSON / Bearer JWT) ---> [ Express.js Backend ] <--- Prisma ORM ---> [ PostgreSQL / SQLite ]
```

## 2. Authentication & Security Layer
- **Token Format:** JSON Web Tokens (JWT) signed with `JWT_SECRET`.
- **RBAC Enforcement:** `authorize(['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'])` middleware inspects decoded user claims and prevents unauthorized role access.
- **Audit Logs:** System actions (logins, mark updates, fee records, student creation) trigger automated records written to `AuditLog`.

## 3. Database Schema Models (Prisma)
1. `User` - Base credentials & avatar metadata
2. `Student` - Student ID code, guardian contacts, department & program relations
3. `Teacher` - Faculty ID code, qualification, department relation
4. `Staff` - Registrar & finance staff profiles
5. `Department` - Academic faculties (CS, EE, ME, BUS)
6. `Program` - Degree programs (BSCS, BSEE, BBA)
7. `Course` & `Subject` - Curriculum tracks and credit hours
8. `Attendance` - Daily class attendance records
9. `Exam`, `ExamQuestion`, `ExamAttempt` - Online MCQ simulator & offline exams
10. `Result` - Grades, percentages & GPA points
11. `Assignment` & `AssignmentSubmission` - Homework assignments & file solutions
12. `Timetable` - Weekly calendar slots
13. `Fee` & `FeePayment` - Tuition billing & receipts
14. `Notice` & `Event` - Announcements and event RSVPs
15. `Book` & `BookIssue` - Library catalog and issue history
16. `Document` - Academic transcripts and certificates
17. `Notification` - In-app notification center
18. `AIConversation` & `AIMessage` - CampusAI query history
19. `SystemSetting` - Global campus parameters
20. `AuditLog` - Activity tracking log

## 4. CampusAI Engine
- Contextual query engine fetches logged-in student database records to answer questions regarding attendance warnings, exam dates, results, and fees while preserving data privacy across student profiles.
