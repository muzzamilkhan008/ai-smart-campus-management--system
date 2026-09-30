import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, subjectId, type, status } = req.query;
    const where: any = {};

    if (teacherId) where.teacherId = String(teacherId);
    if (subjectId) where.subjectId = String(subjectId);
    if (type) where.type = String(type);
    if (status) where.status = String(status);

    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
        questions: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { examDate: 'asc' },
    });

    return res.json({ exams });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch exams.', error: error.message });
  }
};

export const getExamById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        questions: true,
        attempts: { include: { student: { include: { user: true } } } },
      },
    });

    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // Hide correct answers if student is taking test
    if (req.user?.role === 'STUDENT') {
      const sanitizedQuestions = exam.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
      return res.json({ exam: { ...exam, questions: sanitizedQuestions } });
    }

    return res.json({ exam });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch exam.', error: error.message });
  }
};

export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subjectId, examDate, startTime, durationMinutes, totalMarks, passingMarks, type, questions } = req.body;

    if (!title || !subjectId || !examDate || !startTime) {
      return res.status(400).json({ message: 'Title, subjectId, examDate, and startTime are required.' });
    }

    const teacherId = req.user?.teacherId || req.body.teacherId || null;

    const exam = await prisma.exam.create({
      data: {
        title,
        subjectId,
        teacherId,
        examDate,
        startTime,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
        totalMarks: totalMarks ? Number(totalMarks) : 100,
        passingMarks: passingMarks ? Number(passingMarks) : 40,
        type: type || 'OFFLINE',
        status: 'UPCOMING',
      },
    });

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        await prisma.examQuestion.create({
          data: {
            examId: exam.id,
            questionText: q.questionText,
            questionType: q.questionType || 'MCQ',
            options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer,
            marks: q.marks ? Number(q.marks) : 1,
          },
        });
      }
    }

    await logAudit(req.user?.id, 'CREATE_EXAM', 'Exam', `Created exam ${title} (${exam.type})`);
    return res.status(201).json({ message: 'Exam created successfully.', exam });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create exam.', error: error.message });
  }
};

export const submitOnlineExam = async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // Map of questionId -> student's selected answer string
    const studentId = req.user?.studentId;

    if (!studentId) return res.status(400).json({ message: 'Student ID required.' });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true, subject: true },
    });

    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // Check if already attempted
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });

    if (existingAttempt) {
      return res.status(400).json({ message: 'You have already submitted this exam.' });
    }

    // Auto grade MCQ questions
    let scoreObtained = 0;
    let totalPossibleMarks = 0;

    exam.questions.forEach((q) => {
      totalPossibleMarks += q.marks;
      const studentAns = answers?.[q.id];
      if (studentAns && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        scoreObtained += q.marks;
      }
    });

    const percentage = totalPossibleMarks > 0 ? Number(((scoreObtained / totalPossibleMarks) * 100).toFixed(1)) : 0;

    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId,
        answersJson: JSON.stringify(answers || {}),
        scoreObtained,
        percentage,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Also update or create Result entry automatically for student!
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';
    const gpaPoint = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.7 : percentage >= 70 ? 3.3 : percentage >= 60 ? 3.0 : percentage >= 50 ? 2.0 : 0.0;

    await prisma.result.upsert({
      where: {
        studentId_subjectId_semester: {
          studentId,
          subjectId: exam.subjectId,
          semester: exam.subject.semester,
        },
      },
      update: {
        examId,
        obtainedMarks: scoreObtained,
        percentage,
        grade,
        gpaPoint,
      },
      create: {
        studentId,
        subjectId: exam.subjectId,
        examId,
        totalMarks: totalPossibleMarks,
        obtainedMarks: scoreObtained,
        percentage,
        grade,
        gpaPoint,
        semester: exam.subject.semester,
      },
    });

    await logAudit(req.user?.id, 'SUBMIT_EXAM', 'ExamAttempt', `Submitted online exam ${exam.title}. Score: ${scoreObtained}/${totalPossibleMarks}`);

    return res.json({
      message: 'Exam submitted successfully.',
      attempt: {
        scoreObtained,
        totalPossibleMarks,
        percentage,
        grade,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to submit exam.', error: error.message });
  }
};
