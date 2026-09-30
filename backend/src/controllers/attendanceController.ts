import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, subjectId, date, startDate, endDate } = req.query;
    const where: any = {};

    if (studentId) where.studentId = String(studentId);
    if (subjectId) where.subjectId = String(subjectId);
    if (date) where.date = String(date);
    if (startDate && endDate) {
      where.date = { gte: String(startDate), lte: String(endDate) };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'desc' },
    });

    return res.json({ records });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch attendance.', error: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, date, attendanceData } = req.body;
    // attendanceData is array of { studentId: string, status: 'PRESENT'|'ABSENT'|'LATE'|'EXCUSED', remarks?: string }
    if (!subjectId || !date || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: 'subjectId, date, and attendanceData array are required.' });
    }

    const systemSetting = await prisma.systemSetting.findFirst();
    const threshold = systemSetting?.attendanceThreshold || 75.0;

    const results = [];
    for (const item of attendanceData) {
      const record = await prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: item.studentId,
            subjectId,
            date,
          },
        },
        update: {
          status: item.status,
          remarks: item.remarks || null,
        },
        create: {
          studentId: item.studentId,
          subjectId,
          date,
          status: item.status,
          remarks: item.remarks || null,
        },
      });
      results.push(record);

      // Check student overall attendance percentage for warning notification
      const studentAttendances = await prisma.attendance.findMany({
        where: { studentId: item.studentId, subjectId },
      });
      const total = studentAttendances.length;
      const present = studentAttendances.filter(a => a.status === 'PRESENT').length;
      const pct = total > 0 ? (present / total) * 100 : 100;

      if (pct < threshold) {
        const student = await prisma.student.findUnique({ where: { id: item.studentId }, include: { user: true } });
        if (student) {
          await prisma.notification.create({
            data: {
              userId: student.userId,
              title: 'Low Attendance Warning',
              message: `Your attendance in subject has fallen to ${pct.toFixed(1)}%, which is below the required ${threshold}% threshold.`,
              type: 'SYSTEM',
            },
          });
        }
      }
    }

    await logAudit(req.user?.id, 'MARK_ATTENDANCE', 'Attendance', `Marked ${attendanceData.length} records for subject ${subjectId} on ${date}`);
    return res.json({ message: 'Attendance marked successfully.', count: results.length });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to mark attendance.', error: error.message });
  }
};

export const getStudentAttendanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId || req.user?.studentId;
    if (!studentId) return res.status(400).json({ message: 'Student ID required.' });

    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: { subject: true },
      orderBy: { date: 'asc' },
    });

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;

    const overallPct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;

    // Subject breakdown
    const subjectMap: Record<string, { subjectName: string; subjectCode: string; total: number; present: number }> = {};
    for (const r of records) {
      const code = r.subject.code;
      if (!subjectMap[code]) {
        subjectMap[code] = { subjectName: r.subject.name, subjectCode: code, total: 0, present: 0 };
      }
      subjectMap[code].total += 1;
      if (r.status === 'PRESENT') subjectMap[code].present += 1;
    }

    const subjectBreakdown = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Number(((s.present / s.total) * 100).toFixed(1)) : 100,
    }));

    return res.json({
      summary: { total, present, absent, late, excused, overallPct },
      subjectBreakdown,
      recentRecords: records.slice(-10),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to get analytics.', error: error.message });
  }
};

export const getCampusAttendanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.attendance.findMany();
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;

    const averagePct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 92.5;

    // Attendance trend grouped by date
    const dateMap: Record<string, { date: string; present: number; absent: number }> = {};
    for (const r of records) {
      if (!dateMap[r.date]) dateMap[r.date] = { date: r.date, present: 0, absent: 0 };
      if (r.status === 'PRESENT') dateMap[r.date].present += 1;
      else dateMap[r.date].absent += 1;
    }

    const trend = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      averagePct,
      totalRecords: total,
      breakdown: { present, absent, late },
      trend,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch campus analytics.', error: error.message });
  }
};
