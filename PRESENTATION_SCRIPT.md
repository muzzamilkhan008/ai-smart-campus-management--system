# 🎤 5–7 Minute Classroom Presentation Script
## AI Smart Campus Management System

> **Presenter Notes:** Follow this script for a smooth, high-impact demonstration in front of your class, instructor, or university panel.

---

### ⏱️ 0:00 – 1:00 | Introduction & Problem Statement

**Speaker:**
> *"Good morning/afternoon everyone. Today, I am excited to present the **AI Smart Campus Management System** — 'One Smart Platform for the Entire Campus'."*
>
> *"Traditional university management software is often fragmented, outdated, and lacks real-time student engagement. Administrators struggle with disconnected billing and reports, faculty waste time marking paper attendance, and students have no easy way to query their academic standing or calculate their GPA."*
>
> *"Our solution is a modern full-stack web application built with **React, TypeScript, Node.js, Express, Prisma ORM, and Tailwind CSS**. It brings real-time role-based control to Administrators, Teachers, and Students, complemented by an intelligent AI assistant called **CampusAI**."*

---

### ⏱MODE: 1:00 – 3:00 | Executive Admin Dashboard & Student Management

**Speaker:** *(Navigating to `http://localhost:5173/login` and clicking Admin)*
> *"Let's begin by signing in as the **System Administrator**."*
>
> *"On the Executive Dashboard, we immediately see real-time database metrics: total enrolled students, faculty members, active course tracks, and campus-wide attendance percentage. Below, our interactive Recharts visualizations show student enrollment trends and fee collection status."*
>
> *(Clicking 'Students' menu)*
> *"In the Student Directory, we have full CRUD capabilities. We can search students by ID or name, filter by department, add new students, and export filtered data directly to CSV."*
>
> *(Clicking 'Fees' and 'Reports')*
> *"We can also generate tuition fee invoices, record bank or online card payments, and view campus-wide executive audit logs."*

---

### ⏱️ 3:00 – 4:30 | Teacher Portal & Attendance Marking

**Speaker:** *(Logging out and logging in as `teacher1@campus.edu`)*
> *"Now let's switch to the **Teacher Portal**."*
>
> *"Instructors see their assigned courses. With our Class Attendance Sheet, teachers select a subject and date to mark Present, Absent, or Late for each student in seconds."*
>
> *"When attendance is saved, our backend automatically calculates the student's attendance percentage. If a student falls below the configured 75% university threshold, an automated warning notification is instantly issued to their portal."*

---

### ⏱️ 4:30 – 6:00 | Student Portal, Online MCQ Simulator & CampusAI

**Speaker:** *(Logging out and logging in as `student1@campus.edu`)*
> *"Finally, let's explore the **Student Portal**."*
>
> *"Students get a personalized dashboard showing their attendance rate, current CGPA, enrolled courses, and upcoming exams."*
>
> *(Clicking 'Exams')*
> *"Students can launch our **Timed Online MCQ Exam Simulator**, answer questions, submit, and receive an instant auto-graded score card."*
>
> *(Clicking 'CampusAI Assistant')*
> *"The highlight of our platform is **CampusAI**. Unlike generic chatbots, CampusAI is connected directly to the authenticated student's database records. Watch as I ask: 'What is my attendance?' or 'When is my next exam?'."*
>
> *"CampusAI fetches their exact attendance rate, checks for threshold warnings, and lists their scheduled exams while strictly maintaining profile privacy so students can never see another student's data."*

---

### ⏱️ 6:00 – 7:00 | Technology, Security & Conclusion

**Speaker:**
> *"To conclude, our system is fully tested with **14/14 automated end-to-end integration tests**, features strict **JWT and Role-Based Access Control (RBAC)**, includes dark/light mode, and is production-ready with Docker container configurations."*
>
> *"Thank you for your time! I'm happy to take any questions."*
