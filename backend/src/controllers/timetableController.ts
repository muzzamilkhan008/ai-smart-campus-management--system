import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getTimetable = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, semester, section, dayOfWeek } = req.query;
    const where: any = {};

    if (teacherId) where.teacherId = String(teacherId);
    if (semester) where.semester = Number(semester);
    if (section) where.section = String(section);
    if (dayOfWeek) where.dayOfWeek = String(dayOfWeek);

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return res.json({ timetable });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch timetable.', error: error.message });
  }
};

export const createTimetableSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { dayOfWeek, startTime, endTime, subjectId, teacherId, roomNumber, section, semester } = req.body;

    if (!dayOfWeek || !startTime || !endTime || !subjectId || !roomNumber) {
      return res.status(400).json({ message: 'Day, times, subjectId, and roomNumber are required.' });
    }

    const slot = await prisma.timetable.create({
      data: {
        dayOfWeek: dayOfWeek.toUpperCase(),
        startTime,
        endTime,
        subjectId,
        teacherId: teacherId || null,
        roomNumber,
        section: section || 'A',
        semester: semester ? Number(semester) : 1,
      },
      include: { subject: true, teacher: { include: { user: true } } },
    });

    await logAudit(req.user?.id, 'CREATE_TIMETABLE', 'Timetable', `Added timetable slot ${dayOfWeek} ${startTime} (${roomNumber})`);
    return res.status(201).json({ message: 'Timetable slot created successfully.', slot });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create timetable slot.', error: error.message });
  }
};

export const deleteTimetableSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.timetable.delete({ where: { id } });
    await logAudit(req.user?.id, 'DELETE_TIMETABLE', 'Timetable', `Deleted timetable slot ${id}`);
    return res.json({ message: 'Timetable slot deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete timetable slot.', error: error.message });
  }
};
