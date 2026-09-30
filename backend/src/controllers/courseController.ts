import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        program: true,
        subjects: {
          include: { teacher: { include: { user: { select: { name: true } } } } },
        },
        _count: { select: { enrollments: true } },
      },
    });
    return res.json({ courses });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch courses.', error: error.message });
  }
};

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, semester, courseId } = req.query;
    const where: any = {};

    if (teacherId) where.teacherId = String(teacherId);
    if (semester) where.semester = Number(semester);
    if (courseId) where.courseId = String(courseId);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        course: { include: { department: true } },
        teacher: { include: { user: { select: { name: true, email: true } } } },
      },
    });
    return res.json({ subjects });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch subjects.', error: error.message });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, description, departmentId, programId } = req.body;
    if (!code || !name || !departmentId) return res.status(400).json({ message: 'Code, name, and departmentId are required.' });

    const course = await prisma.course.create({
      data: { code: code.toUpperCase(), name, description, departmentId, programId },
    });

    await logAudit(req.user?.id, 'CREATE_COURSE', 'Course', `Created course ${code}`);
    return res.status(201).json({ message: 'Course created successfully.', course });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create course.', error: error.message });
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, creditHours, semester, courseId, teacherId } = req.body;
    if (!code || !name || !courseId) return res.status(400).json({ message: 'Code, name, and courseId are required.' });

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase(),
        name,
        creditHours: creditHours ? Number(creditHours) : 3,
        semester: semester ? Number(semester) : 1,
        courseId,
        teacherId: teacherId || null,
      },
    });

    await logAudit(req.user?.id, 'CREATE_SUBJECT', 'Subject', `Created subject ${code}`);
    return res.status(201).json({ message: 'Subject created successfully.', subject });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create subject.', error: error.message });
  }
};

export const assignTeacherToSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { teacherId } = req.body;

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: { teacherId },
      include: { teacher: { include: { user: true } } },
    });

    await logAudit(req.user?.id, 'ASSIGN_TEACHER', 'Subject', `Assigned teacher to subject ${subject.code}`);
    return res.json({ message: 'Teacher assigned to subject successfully.', subject });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to assign teacher.', error: error.message });
  }
};
