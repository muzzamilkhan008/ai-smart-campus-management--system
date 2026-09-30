# 🧪 Testing Guide — AI Smart Campus Management System

## Automated Test Execution

The system includes an automated integration & business logic test suite located at `backend/tests/run-tests.ts`.

### How to Run Tests

```bash
cd backend
npm test
```

### Verified Test Cases

1. **Health Check:** `GET /api/health` returns status 200 and success status.
2. **Admin Authentication:** `POST /api/auth/login` verifies admin credentials and returns JWT token.
3. **Teacher Authentication:** `POST /api/auth/login` verifies faculty credentials.
4. **Student Authentication:** `POST /api/auth/login` verifies student credentials.
5. **RBAC Protection:** Confirms student token is blocked (403 Forbidden) from accessing admin routes (`GET /api/users`).
6. **Student Directory API:** `GET /api/students` retrieves active enrolled cohort.
7. **Attendance Analytics:** `GET /api/attendance/campus-analytics` returns compliance metrics.
8. **GPA Calculator Engine:** `POST /api/results/calculate-gpa` verifies accurate GPA calculation.
9. **CampusAI Query Engine:** `POST /api/ai/chat` verifies contextual database retrieval for logged in student.
10. **Consolidated Reports API:** `GET /api/reports` returns executive metrics.
