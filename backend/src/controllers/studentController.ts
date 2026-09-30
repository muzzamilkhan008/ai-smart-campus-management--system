import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { search, departmentId, programId, semester, status, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { studentIdCode: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
      ];
    }

    if (departmentId) where.departmentId = String(departmentId);
    if (programId) where.programId = String(programId);
    if (semester) where.semester = Number(semester);
    if (status) where.status = String(status);

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, isActive: true } },
          department: { select: { id: true, name: true, code: true } },
          program: { select: { id: true, name: true, code: true } },
        },
        skip,
        take: limitNum,
        orderBy: sortBy === 'name' ? { user: { name: sortOrder as any } } : { createdAt: sortOrder as any },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, username: true, phone: true, address: true, avatar: true, isActive: true } },
        department: true,
        program: true,
        enrollments: { include: { course: true } },
        attendances: { include: { subject: true } },
        examAttempts: { include: { exam: true } },
        results: { include: { subject: true, exam: true } },
        submissions: { include: { assignment: true } },
        feeInvoices: { include: { payments: true } },
        documents: true,
        bookIssues: { include: { book: true } },
      },
    });

    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Calculate aggregate attendance stats for overview tab
    const totalAttendanceDays = student.attendances.length;
    const presentDays = student.attendances.filter((a) => a.status === 'PRESENT').length;
    const attendancePct = totalAttendanceDays > 0 ? ((presentDays / totalAttendanceDays) * 100).toFixed(1) : '100.0';

    // Calculate CGPA
    const totalGpaPoints = student.results.reduce((acc, curr) => acc + curr.gpaPoint, 0);
    const cgpa = student.results.length > 0 ? (totalGpaPoints / student.results.length).toFixed(2) : 'N/A';

    return res.json({
      student,
      summary: {
        attendancePct: Number(attendancePct),
        cgpa,
        totalEnrolledCourses: student.enrollments.length,
        totalFeesPending: student.feeInvoices.reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch student details.', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, dob, gender, address, guardianName, guardianContact, departmentId, programId, semester, section } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists.' });

    const passwordHash = await bcrypt.hash('password123', 10);
    const username = email.split('@')[0] + Math.floor(10 + Math.random() * 90);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        username,
        passwordHash,
        role: 'STUDENT',
        phone,
        address,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    });

    const studentCount = await prisma.student.count();
    const studentIdCode = `STU-${new Date().getFullYear()}-${String(studentCount + 1).padStart(3, '0')}`;

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentIdCode,
        dob,
        gender,
        admissionDate: new Date().toISOString().split('T')[0],
        guardianName,
        guardianContact,
        departmentId: departmentId || null,
        programId: programId || null,
        semester: semester ? Number(semester) : 1,
        section: section || 'A',
      },
      include: {
        user: true,
        department: true,
        program: true,
      },
    });

    await logAudit(req.user?.id, 'CREATE_STUDENT', 'Student', `Created student ${student.studentIdCode} (${name})`);

    return res.status(201).json({ message: 'Student created successfully.', student });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create student.', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, dob, gender, guardianName, guardianContact, departmentId, programId, semester, section, status } = req.body;

    const existingStudent = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!existingStudent) return res.status(404).json({ message: 'Student not found.' });

    if (name || phone !== undefined || address !== undefined) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: {
          name: name || existingStudent.user.name,
          phone: phone !== undefined ? phone : existingStudent.user.phone,
          address: address !== undefined ? address : existingStudent.user.address,
        },
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        dob: dob !== undefined ? dob : existingStudent.dob,
        gender: gender !== undefined ? gender : existingStudent.gender,
        guardianName: guardianName !== undefined ? guardianName : existingStudent.guardianName,
        guardianContact: guardianContact !== undefined ? guardianContact : existingStudent.guardianContact,
        departmentId: departmentId !== undefined ? departmentId : existingStudent.departmentId,
        programId: programId !== undefined ? programId : existingStudent.programId,
        semester: semester !== undefined ? Number(semester) : existingStudent.semester,
        section: section !== undefined ? section : existingStudent.section,
        status: status !== undefined ? status : existingStudent.status,
      },
      include: {
        user: true,
        department: true,
        program: true,
      },
    });

    await logAudit(req.user?.id, 'UPDATE_STUDENT', 'Student', `Updated student ${updatedStudent.studentIdCode}`);

    return res.json({ message: 'Student updated successfully.', student: updatedStudent });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update student.', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Cascade delete user account
    await prisma.user.delete({ where: { id: student.userId } });

    await logAudit(req.user?.id, 'DELETE_STUDENT', 'Student', `Deleted student ${student.studentIdCode}`);

    return res.json({ message: 'Student deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete student.', error: error.message });
  }
};
