import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, departmentId, status } = req.query;
    const where: any = {};

    if (search) {
      where.OR = [
        { teacherIdCode: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
      ];
    }

    if (departmentId) where.departmentId = String(departmentId);
    if (status) where.status = String(status);

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        subjects: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ teachers });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch teachers.', error: error.message });
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        subjects: { include: { course: true } },
        timetables: { include: { subject: true } },
        exams: true,
        assignments: { include: { submissions: true } },
      },
    });

    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
    return res.json({ teacher });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch teacher profile.', error: error.message });
  }
};

export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, qualification, departmentId, joiningDate } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash('password123', 10);
    const username = email.split('@')[0] + Math.floor(10 + Math.random() * 90);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        username,
        passwordHash,
        role: 'TEACHER',
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    });

    const teacherCount = await prisma.teacher.count();
    const teacherIdCode = `TCH-${new Date().getFullYear()}-${String(teacherCount + 1).padStart(3, '0')}`;

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        teacherIdCode,
        qualification,
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        departmentId: departmentId || null,
      },
      include: { user: true, department: true },
    });

    await logAudit(req.user?.id, 'CREATE_TEACHER', 'Teacher', `Created teacher ${teacher.teacherIdCode} (${name})`);
    return res.status(201).json({ message: 'Teacher created successfully.', teacher });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create teacher.', error: error.message });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, qualification, departmentId, status } = req.body;

    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    if (name || phone !== undefined) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: {
          name: name || teacher.user.name,
          phone: phone !== undefined ? phone : teacher.user.phone,
        },
      });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        qualification: qualification !== undefined ? qualification : teacher.qualification,
        departmentId: departmentId !== undefined ? departmentId : teacher.departmentId,
        status: status !== undefined ? status : teacher.status,
      },
      include: { user: true, department: true, subjects: true },
    });

    await logAudit(req.user?.id, 'UPDATE_TEACHER', 'Teacher', `Updated teacher ${updatedTeacher.teacherIdCode}`);
    return res.json({ message: 'Teacher updated successfully.', teacher: updatedTeacher });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update teacher.', error: error.message });
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    await prisma.user.delete({ where: { id: teacher.userId } });
    await logAudit(req.user?.id, 'DELETE_TEACHER', 'Teacher', `Deleted teacher ${teacher.teacherIdCode}`);
    return res.json({ message: 'Teacher deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete teacher.', error: error.message });
  }
};
