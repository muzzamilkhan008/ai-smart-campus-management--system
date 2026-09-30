import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.bookIssue.deleteMany();
  await prisma.book.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.result.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create System Settings
  await prisma.systemSetting.create({
    data: {
      institutionName: 'AI Smart Campus University',
      institutionLogo: '/assets/logo.png',
      academicYear: '2025-2026',
      currentSemester: 'Spring 2026',
      attendanceThreshold: 75.0,
      currency: 'USD',
      gradingSystem: 'GPA_4',
      theme: 'SYSTEM',
    },
  });

  const commonPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Dr. Arthur Pendelton',
      phone: '+1 (555) 019-2831',
      address: '100 University Avenue, Main Administration Bldg, Suite 400',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  // 2. Create Departments
  const csDept = await prisma.department.create({
    data: { code: 'CS', name: 'Computer Science & AI', description: 'Department of Computer Science, Software Engineering & Artificial Intelligence' },
  });
  const eeDept = await prisma.department.create({
    data: { code: 'EE', name: 'Electrical & Computer Engineering', description: 'Department of Electrical, Electronics and Embedded Systems' },
  });
  const meDept = await prisma.department.create({
    data: { code: 'ME', name: 'Mechanical Engineering', description: 'Department of Mechanical & Robotics Engineering' },
  });
  const busDept = await prisma.department.create({
    data: { code: 'BUS', name: 'School of Business & Analytics', description: 'Department of Business Administration & Management' },
  });

  // 3. Create Programs
  const bscs = await prisma.program.create({
    data: { code: 'BSCS', name: 'Bachelor of Science in Computer Science', departmentId: csDept.id, durationYears: 4, totalSemesters: 8 },
  });
  const bsee = await prisma.program.create({
    data: { code: 'BSEE', name: 'Bachelor of Science in Electrical Engineering', departmentId: eeDept.id, durationYears: 4, totalSemesters: 8 },
  });
  const bsme = await prisma.program.create({
    data: { code: 'BSME', name: 'Bachelor of Science in Mechanical Engineering', departmentId: meDept.id, durationYears: 4, totalSemesters: 8 },
  });
  const bba = await prisma.program.create({
    data: { code: 'BBA', name: 'Bachelor of Business Administration', departmentId: busDept.id, durationYears: 4, totalSemesters: 8 },
  });

  // 4. Create Teachers
  const teacherData = [
    { email: 'teacher1@campus.edu', username: 'teacher1', name: 'Prof. Alan Turing', deptId: csDept.id, qual: 'Ph.D. in AI & Computing', idCode: 'TCH-2026-001' },
    { email: 'teacher2@campus.edu', username: 'teacher2', name: 'Dr. Ada Lovelace', deptId: csDept.id, qual: 'Ph.D. in Software Architecture', idCode: 'TCH-2026-002' },
    { email: 'teacher3@campus.edu', username: 'teacher3', name: 'Prof. Nikola Tesla', deptId: eeDept.id, qual: 'Ph.D. in Electrical Power Systems', idCode: 'TCH-2026-003' },
    { email: 'teacher4@campus.edu', username: 'teacher4', name: 'Dr. Katherine Johnson', deptId: meDept.id, qual: 'Ph.D. in Applied Mathematics & Mechanics', idCode: 'TCH-2026-004' },
    { email: 'teacher5@campus.edu', username: 'teacher5', name: 'Prof. Michael Porter', deptId: busDept.id, qual: 'Ph.D. in Strategic Management', idCode: 'TCH-2026-005' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        username: t.username,
        passwordHash: commonPassword,
        role: 'TEACHER',
        name: t.name,
        phone: '+1 (555) 012-34' + Math.floor(10 + Math.random() * 89),
        address: 'Campus Faculty Housing, Block B',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.username}`,
      },
    });
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        teacherIdCode: t.idCode,
        qualification: t.qual,
        joiningDate: '2021-08-15',
        departmentId: t.deptId,
      },
    });
    teachers.push(teacher);
  }

  // Set Department Heads
  await prisma.department.update({ where: { id: csDept.id }, data: { headId: teachers[0].id } });
  await prisma.department.update({ where: { id: eeDept.id }, data: { headId: teachers[2].id } });

  // 5. Create Staff Member
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@campus.edu',
      username: 'staff',
      passwordHash: commonPassword,
      role: 'STAFF',
      name: 'Sarah Jenkins',
      phone: '+1 (555) 998-1122',
      address: 'Registrar Office, Room 102',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff',
    },
  });
  await prisma.staff.create({
    data: {
      userId: staffUser.id,
      staffIdCode: 'STF-2026-001',
      designation: 'Senior Registrar & Finance Officer',
      departmentId: busDept.id,
    },
  });

  // 6. Create Courses & Subjects
  const cs101Course = await prisma.course.create({
    data: { code: 'CS-CORE', name: 'Computer Science Core Track', departmentId: csDept.id, programId: bscs.id, description: 'Core CS Foundations & Software Engineering' },
  });
  const ee101Course = await prisma.course.create({
    data: { code: 'EE-CORE', name: 'Electrical Engineering Track', departmentId: eeDept.id, programId: bsee.id, description: 'Circuits, Signals & Embedded Systems' },
  });

  const subjectsData = [
    { code: 'CS101', name: 'Introduction to Computer Science', creditHours: 4, semester: 1, courseId: cs101Course.id, teacherId: teachers[0].id },
    { code: 'CS102', name: 'Data Structures & Algorithms', creditHours: 4, semester: 2, courseId: cs101Course.id, teacherId: teachers[0].id },
    { code: 'CS201', name: 'Artificial Intelligence & Neural Nets', creditHours: 3, semester: 3, courseId: cs101Course.id, teacherId: teachers[1].id },
    { code: 'CS202', name: 'Database Management Systems', creditHours: 3, semester: 3, courseId: cs101Course.id, teacherId: teachers[1].id },
    { code: 'EE101', name: 'Linear Circuit Analysis', creditHours: 4, semester: 1, courseId: ee101Course.id, teacherId: teachers[2].id },
    { code: 'EE201', name: 'Digital Logic & Design', creditHours: 3, semester: 2, courseId: ee101Course.id, teacherId: teachers[2].id },
  ];

  const subjects = [];
  for (const s of subjectsData) {
    const subj = await prisma.subject.create({ data: s });
    subjects.push(subj);
  }

  // 7. Create 30 Students
  const students = [];
  const firstNames = ['Alexander', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Mila', 'Logan', 'Ella'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  for (let i = 1; i <= 30; i++) {
    const fName = firstNames[i - 1];
    const lName = lastNames[i - 1];
    const username = `student${i}`;
    const email = `student${i}@campus.edu`;
    const idCode = `STU-2026-${String(i).padStart(3, '0')}`;
    
    // Choose department
    const dept = i % 4 === 1 ? csDept : i % 4 === 2 ? eeDept : i % 4 === 3 ? meDept : busDept;
    const prog = i % 4 === 1 ? bscs : i % 4 === 2 ? bsee : i % 4 === 3 ? bsme : bba;
    const semester = ((i - 1) % 4) + 1;

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: commonPassword,
        role: 'STUDENT',
        name: `${fName} ${lName}`,
        phone: `+1 (555) 789-01${String(i).padStart(2, '0')}`,
        address: `${100 + i} Campus Dormitories, Sector ${i % 3 + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentIdCode: idCode,
        dob: '2003-05-15',
        gender: i % 2 === 0 ? 'Male' : 'Female',
        admissionDate: '2024-09-01',
        guardianName: `Robert ${lName}`,
        guardianContact: `+1 (555) 900-11${String(i).padStart(2, '0')}`,
        departmentId: dept.id,
        programId: prog.id,
        semester,
        section: i % 2 === 0 ? 'A' : 'B',
        status: 'ACTIVE',
      },
    });
    students.push(student);

    // Enroll in CS Core
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: cs101Course.id,
        semester,
        academicYear: '2025-2026',
        status: 'ENROLLED',
      },
    });
  }

  console.log(`✅ Created ${students.length} students, 5 teachers, 4 departments`);

  // 8. Attendance Records (Last 15 days)
  const student1 = students[0]; // Alex Smith (CS student)
  const student2 = students[1]; // Emma Johnson (Low attendance for testing AI alert!)

  const dates = ['2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'];
  
  for (const s of students) {
    for (const d of dates) {
      // Give student2 50% attendance to trigger AI alert, student1 90% attendance
      let status = 'PRESENT';
      if (s.id === student2.id) {
        status = Math.random() > 0.4 ? 'ABSENT' : 'PRESENT';
      } else {
        status = Math.random() > 0.15 ? 'PRESENT' : (Math.random() > 0.5 ? 'LATE' : 'ABSENT');
      }

      await prisma.attendance.create({
        data: {
          studentId: s.id,
          subjectId: subjects[0].id,
          date: d,
          status,
          remarks: status === 'LATE' ? 'Arrived 10 mins late' : null,
        },
      });
    }
  }

  // 9. Exams & MCQ Questions
  const csExamOnline = await prisma.exam.create({
    data: {
      title: 'Midterm MCQ Test: Data Structures & Algorithms',
      subjectId: subjects[1].id,
      teacherId: teachers[0].id,
      examDate: '2026-10-15',
      startTime: '10:00',
      durationMinutes: 45,
      totalMarks: 30,
      passingMarks: 15,
      type: 'ONLINE',
      status: 'UPCOMING',
    },
  });

  await prisma.examQuestion.createMany({
    data: [
      {
        examId: csExamOnline.id,
        questionText: 'What is the worst-case time complexity of QuickSort?',
        questionType: 'MCQ',
        options: JSON.stringify(['O(N log N)', 'O(N^2)', 'O(N)', 'O(1)']),
        correctAnswer: 'O(N^2)',
        marks: 10,
      },
      {
        examId: csExamOnline.id,
        questionText: 'Which data structure follows LIFO (Last In First Out)?',
        questionType: 'MCQ',
        options: JSON.stringify(['Queue', 'Stack', 'Array', 'Linked List']),
        correctAnswer: 'Stack',
        marks: 10,
      },
      {
        examId: csExamOnline.id,
        questionText: 'A Binary Search Tree guarantees O(log N) operations in all cases.',
        questionType: 'TRUE_FALSE',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'False',
        marks: 10,
      },
    ],
  });

  const aiExamOffline = await prisma.exam.create({
    data: {
      title: 'Final Examination: Artificial Intelligence',
      subjectId: subjects[2].id,
      teacherId: teachers[1].id,
      examDate: '2026-09-20',
      startTime: '09:00',
      durationMinutes: 120,
      totalMarks: 100,
      passingMarks: 50,
      type: 'OFFLINE',
      status: 'COMPLETED',
    },
  });

  // 10. Results & Grade Records
  await prisma.result.createMany({
    data: [
      { studentId: student1.id, subjectId: subjects[0].id, examId: aiExamOffline.id, totalMarks: 100, obtainedMarks: 92, percentage: 92, grade: 'A+', gpaPoint: 4.0, semester: 1, remarks: 'Outstanding performance!' },
      { studentId: student1.id, subjectId: subjects[1].id, examId: aiExamOffline.id, totalMarks: 100, obtainedMarks: 85, percentage: 85, grade: 'A', gpaPoint: 3.8, semester: 1, remarks: 'Excellent grasp of concepts' },
      { studentId: student1.id, subjectId: subjects[2].id, examId: aiExamOffline.id, totalMarks: 100, obtainedMarks: 78, percentage: 78, grade: 'B+', gpaPoint: 3.3, semester: 1, remarks: 'Good progress' },
      { studentId: student2.id, subjectId: subjects[0].id, examId: aiExamOffline.id, totalMarks: 100, obtainedMarks: 62, percentage: 62, grade: 'C', gpaPoint: 2.0, semester: 1, remarks: 'Needs improvement in attendance & lab tasks' },
    ],
  });

  // 11. Assignments & Submissions
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Assignment 1: Neural Network Architecture Implementation',
      description: 'Implement a 3-layer Multilayer Perceptron from scratch using Python & NumPy. Include loss graphs.',
      subjectId: subjects[2].id,
      teacherId: teachers[1].id,
      deadline: '2026-10-10 23:59',
      totalMarks: 100,
      attachmentUrl: '/documents/nn_assignment_spec.pdf',
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      submissionText: 'GitHub Link: https://github.com/alexsmith/nn-mlp-scratch. All unit tests pass.',
      fileUrl: '/uploads/alex_smith_nn_submission.pdf',
      status: 'GRADED',
      obtainedMarks: 96,
      feedback: 'Excellent clean code with complete mathematical explanations!',
    },
  });

  // 12. Timetable Schedule
  const timetableEntries = [
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30', subjectId: subjects[0].id, teacherId: teachers[0].id, roomNumber: 'Lab 301', section: 'A', semester: 1 },
    { dayOfWeek: 'MONDAY', startTime: '11:00', endTime: '12:30', subjectId: subjects[1].id, teacherId: teachers[0].id, roomNumber: 'Hall B', section: 'A', semester: 1 },
    { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '11:30', subjectId: subjects[2].id, teacherId: teachers[1].id, roomNumber: 'Lab 402', section: 'A', semester: 1 },
    { dayOfWeek: 'WEDNESDAY', startTime: '14:00', endTime: '15:30', subjectId: subjects[3].id, teacherId: teachers[1].id, roomNumber: 'Hall A', section: 'A', semester: 1 },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '10:30', subjectId: subjects[4].id, teacherId: teachers[2].id, roomNumber: 'EE Lab 1', section: 'A', semester: 1 },
  ];
  for (const t of timetableEntries) {
    await prisma.timetable.create({ data: t });
  }

  // 13. Fees & Invoices
  const fee1 = await prisma.fee.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      studentId: student1.id,
      title: 'Spring 2026 Semester Tuition & Campus Fee',
      amount: 2500,
      paidAmount: 2500,
      dueDate: '2026-09-30',
      status: 'PAID',
    },
  });
  await prisma.feePayment.create({
    data: {
      feeId: fee1.id,
      receiptNumber: 'REC-2026-001',
      amountPaid: 2500,
      paymentMethod: 'ONLINE',
      paymentDate: '2026-09-10',
      transactionId: 'TXN-998827361',
    },
  });

  const fee2 = await prisma.fee.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      studentId: student2.id,
      title: 'Spring 2026 Semester Tuition Fee',
      amount: 2500,
      paidAmount: 1000,
      dueDate: '2026-10-15',
      status: 'PARTIAL',
    },
  });
  await prisma.feePayment.create({
    data: {
      feeId: fee2.id,
      receiptNumber: 'REC-2026-002',
      amountPaid: 1000,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2026-09-12',
      transactionId: 'TXN-445511223',
    },
  });

  // 14. Notices & Campus Announcements
  await prisma.notice.createMany({
    data: [
      {
        title: 'Midterm Examination Schedule Released - Spring 2026',
        description: 'The official Midterm examination timetable for all departments is now available on the portal. Please verify exam halls and timings.',
        category: 'Exam',
        priority: 'HIGH',
        publishDate: '2026-09-25',
        authorId: adminUser.id,
        targetRole: 'ALL',
      },
      {
        title: 'Annual Campus AI & Robotics Hackathon 2026',
        description: 'Registrations are open for the 48-hour AI Hackathon! Cash prizes up to $5,000 for top innovative solutions.',
        category: 'Event',
        priority: 'NORMAL',
        publishDate: '2026-09-28',
        authorId: adminUser.id,
        targetRole: 'ALL',
      },
    ],
  });

  // 15. Campus Events
  const event1 = await prisma.event.create({
    data: {
      title: 'Campus AI & Tech Expo 2026',
      description: 'Keynotes from AI industry leaders, research presentations, and student prototype demos.',
      date: '2026-10-25',
      time: '09:00 AM',
      location: 'Grand Auditorium, Innovation Building',
      organizer: 'Department of Computer Science & AI Club',
      maxCapacity: 300,
    },
  });
  await prisma.eventRegistration.create({
    data: {
      eventId: event1.id,
      studentId: student1.id,
    },
  });

  // 16. Library Books & Issue History
  const book1 = await prisma.book.create({
    data: {
      bookCode: 'BK-101',
      title: 'Deep Learning with Python & PyTorch',
      author: 'François Chollet',
      category: 'Artificial Intelligence',
      isbn: '978-1617294433',
      quantity: 5,
      availableCopies: 4,
    },
  });
  const book2 = await prisma.book.create({
    data: {
      bookCode: 'BK-102',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      isbn: '978-0262046305',
      quantity: 10,
      availableCopies: 8,
    },
  });

  await prisma.bookIssue.create({
    data: {
      bookId: book1.id,
      studentId: student1.id,
      issueDate: '2026-09-15',
      dueDate: '2026-10-01',
      status: 'ISSUED',
    },
  });

  // 17. Documents
  await prisma.document.createMany({
    data: [
      {
        title: 'Spring 2026 Academic Calendar',
        type: 'NOTICE',
        fileUrl: '/documents/academic_calendar_2026.pdf',
        uploadedById: adminUser.id,
      },
      {
        title: 'Official Result Transcript - Semester 1',
        type: 'RESULT_CARD',
        fileUrl: '/documents/result_transcript_alex.pdf',
        uploadedById: adminUser.id,
        studentId: student1.id,
      },
      {
        title: 'Tuition Fee Payment Receipt REC-2026-001',
        type: 'FEE_RECEIPT',
        fileUrl: '/documents/receipt_rec_001.pdf',
        uploadedById: adminUser.id,
        studentId: student1.id,
      },
    ],
  });

  // 18. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.userId,
        title: 'Assignment Deadline Reminder',
        message: 'Neural Network Architecture Assignment is due on 2026-10-10.',
        type: 'ASSIGNMENT',
      },
      {
        userId: student1.userId,
        title: 'Fee Payment Received',
        message: 'Your tuition fee payment of $2,500 for Spring 2026 has been processed successfully.',
        type: 'FEE',
      },
    ],
  });

  // 19. Initial Audit Log Entry
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'Database',
      details: 'Populated full database with demo accounts, departments, courses, students, and grades.',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
