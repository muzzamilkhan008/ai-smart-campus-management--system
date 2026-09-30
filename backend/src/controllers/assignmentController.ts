import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, teacherId } = req.query;
    const where: any = {};

    if (subjectId) where.subjectId = String(subjectId);
    if (teacherId) where.teacherId = String(teacherId);

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
        submissions: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ assignments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch assignments.', error: error.message });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, subjectId, deadline, totalMarks, attachmentUrl } = req.body;
    const teacherId = req.user?.teacherId;

    if (!title || !subjectId || !deadline || !teacherId) {
      return res.status(400).json({ message: 'Title, subjectId, and deadline are required.' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subjectId,
        teacherId,
        deadline,
        totalMarks: totalMarks ? Number(totalMarks) : 100,
        attachmentUrl: attachmentUrl || null,
      },
    });

    await logAudit(req.user?.id, 'CREATE_ASSIGNMENT', 'Assignment', `Created assignment ${title}`);
    return res.status(201).json({ message: 'Assignment created successfully.', assignment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create assignment.', error: error.message });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText, fileUrl } = req.body;
    const studentId = req.user?.studentId;

    if (!studentId) return res.status(400).json({ message: 'Student profile required.' });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const nowStr = new Date().toISOString();
    const isLate = new Date(nowStr) > new Date(assignment.deadline);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      update: {
        submissionText: submissionText || null,
        fileUrl: fileUrl || null,
        status: isLate ? 'LATE' : 'SUBMITTED',
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        submissionText: submissionText || null,
        fileUrl: fileUrl || null,
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
    });

    await logAudit(req.user?.id, 'SUBMIT_ASSIGNMENT', 'AssignmentSubmission', `Submitted assignment ${assignment.title}`);
    return res.json({ message: 'Assignment submitted successfully.', submission });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to submit assignment.', error: error.message });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks, feedback } = req.body;

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        obtainedMarks: Number(obtainedMarks),
        feedback: feedback || null,
        status: 'GRADED',
      },
      include: { student: { include: { user: true } }, assignment: true },
    });

    // Send notification to student
    await prisma.notification.create({
      data: {
        userId: submission.student.userId,
        title: 'Assignment Graded',
        message: `Your assignment "${submission.assignment.title}" has been graded: ${obtainedMarks}/${submission.assignment.totalMarks}`,
        type: 'ASSIGNMENT',
      },
    });

    await logAudit(req.user?.id, 'GRADE_ASSIGNMENT', 'AssignmentSubmission', `Graded submission for student ${submission.student.studentIdCode}`);
    return res.json({ message: 'Submission graded successfully.', submission });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to grade submission.', error: error.message });
  }
};
