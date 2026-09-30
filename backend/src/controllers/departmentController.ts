import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        head: { include: { user: { select: { name: true, email: true } } } },
        _count: {
          select: {
            students: true,
            teachers: true,
            courses: true,
            programs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ departments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch departments.', error: error.message });
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        head: { include: { user: true } },
        programs: true,
        teachers: { include: { user: true } },
        students: { include: { user: true } },
        courses: { include: { subjects: true } },
      },
    });

    if (!department) return res.status(404).json({ message: 'Department not found.' });

    // Calculate attendance percentage across department students
    const studentIds = department.students.map(s => s.id);
    const attendances = await prisma.attendance.findMany({
      where: { studentId: { in: studentIds } },
    });
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    const deptAttendancePct = attendances.length > 0 ? ((presentCount / attendances.length) * 100).toFixed(1) : '95.0';

    return res.json({
      department,
      stats: {
        totalStudents: department.students.length,
        totalTeachers: department.teachers.length,
        totalCourses: department.courses.length,
        deptAttendancePct: Number(deptAttendancePct),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch department details.', error: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, description, headId } = req.body;
    if (!code || !name) return res.status(400).json({ message: 'Department code and name are required.' });

    const department = await prisma.department.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        headId: headId || null,
      },
    });

    await logAudit(req.user?.id, 'CREATE_DEPARTMENT', 'Department', `Created department ${code}`);
    return res.status(201).json({ message: 'Department created successfully.', department });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create department.', error: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, description, headId } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: { code, name, description, headId },
    });

    await logAudit(req.user?.id, 'UPDATE_DEPARTMENT', 'Department', `Updated department ${department.code}`);
    return res.json({ message: 'Department updated successfully.', department });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update department.', error: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    await logAudit(req.user?.id, 'DELETE_DEPARTMENT', 'Department', `Deleted department ${id}`);
    return res.json({ message: 'Department deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete department.', error: error.message });
  }
};
