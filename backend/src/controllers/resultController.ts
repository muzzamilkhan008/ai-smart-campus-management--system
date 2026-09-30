import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getResults = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, subjectId, semester } = req.query;
    const where: any = {};

    if (studentId) where.studentId = String(studentId);
    if (subjectId) where.subjectId = String(subjectId);
    if (semester) where.semester = Number(semester);

    const results = await prisma.result.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } }, program: true } },
        subject: true,
        exam: true,
      },
      orderBy: { semester: 'asc' },
    });

    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch results.', error: error.message });
  }
};

export const createOrUpdateResult = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, subjectId, examId, totalMarks, obtainedMarks, semester, remarks } = req.body;

    if (!studentId || !subjectId || obtainedMarks === undefined) {
      return res.status(400).json({ message: 'studentId, subjectId, and obtainedMarks are required.' });
    }

    const maxMarks = totalMarks ? Number(totalMarks) : 100;
    const scored = Number(obtainedMarks);
    const percentage = Number(((scored / maxMarks) * 100).toFixed(1));

    let grade = 'F';
    let gpaPoint = 0.0;
    if (percentage >= 90) { grade = 'A+'; gpaPoint = 4.0; }
    else if (percentage >= 80) { grade = 'A'; gpaPoint = 3.8; }
    else if (percentage >= 75) { grade = 'B+'; gpaPoint = 3.4; }
    else if (percentage >= 70) { grade = 'B'; gpaPoint = 3.0; }
    else if (percentage >= 60) { grade = 'C'; gpaPoint = 2.0; }
    else if (percentage >= 50) { grade = 'D'; gpaPoint = 1.0; }

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_semester: {
          studentId,
          subjectId,
          semester: semester ? Number(semester) : 1,
        },
      },
      update: {
        examId: examId || null,
        totalMarks: maxMarks,
        obtainedMarks: scored,
        percentage,
        grade,
        gpaPoint,
        remarks: remarks || null,
      },
      create: {
        studentId,
        subjectId,
        examId: examId || null,
        totalMarks: maxMarks,
        obtainedMarks: scored,
        percentage,
        grade,
        gpaPoint,
        semester: semester ? Number(semester) : 1,
        remarks: remarks || null,
      },
      include: { student: { include: { user: true } }, subject: true },
    });

    await logAudit(req.user?.id, 'UPDATE_MARKS', 'Result', `Updated result for student ${studentId} in subject ${subjectId}: ${grade} (${percentage}%)`);
    return res.json({ message: 'Result recorded successfully.', result });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to record result.', error: error.message });
  }
};

export const calculateGPA = async (req: AuthRequest, res: Response) => {
  try {
    const { subjects } = req.body; 
    // subjects: array of { subjectName: string, creditHours: number, grade: string }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Array of subjects with creditHours and grade is required.' });
    }

    const gradeMap: Record<string, number> = {
      'A+': 4.0, 'A': 3.8, 'B+': 3.4, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0,
    };

    let totalCredits = 0;
    let totalQualityPoints = 0;

    const detailedBreakdown = subjects.map(s => {
      const gpa = gradeMap[s.grade?.toUpperCase()] ?? 0.0;
      const credits = Number(s.creditHours || 3);
      const qualityPoints = gpa * credits;

      totalCredits += credits;
      totalQualityPoints += qualityPoints;

      return {
        ...s,
        gpaPoint: gpa,
        qualityPoints,
      };
    });

    const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;

    return res.json({
      gpa,
      totalCredits,
      totalQualityPoints,
      breakdown: detailedBreakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'GPA calculation error.', error: error.message });
  }
};

export const getStudentResultCard = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId || req.user?.studentId;
    if (!studentId) return res.status(400).json({ message: 'Student ID required.' });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        department: true,
        program: true,
        results: { include: { subject: true } },
      },
    });

    if (!student) return res.status(404).json({ message: 'Student record not found.' });

    const totalCredits = student.results.reduce((acc, r) => acc + r.subject.creditHours, 0);
    const totalGpaPoints = student.results.reduce((acc, r) => acc + (r.gpaPoint * r.subject.creditHours), 0);
    const cgpa = totalCredits > 0 ? (totalGpaPoints / totalCredits).toFixed(2) : 'N/A';

    return res.json({
      studentInfo: {
        studentIdCode: student.studentIdCode,
        name: student.user.name,
        email: student.user.email,
        department: student.department?.name,
        program: student.program?.name,
        semester: student.semester,
      },
      cgpa,
      totalCredits,
      results: student.results,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to generate result card data.', error: error.message });
  }
};
