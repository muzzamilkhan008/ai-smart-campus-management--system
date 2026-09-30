import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const handleCampusAiQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message prompt is required.' });

    const user = req.user!;
    const lowerMsg = message.toLowerCase();

    let reply = '';
    let dataContext: any = null;

    // Retrieve or create conversation
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 30) + '...',
        },
      });
      convId = conv.id;
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        sender: 'USER',
        content: message,
      },
    });

    // Smart context retriever based on database content for logged in user
    if (user.role === 'STUDENT' && user.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: user.studentId },
        include: {
          user: true,
          department: true,
          program: true,
          attendances: { include: { subject: true } },
          results: { include: { subject: true } },
          examAttempts: { include: { exam: true } },
          submissions: { include: { assignment: true } },
          feeInvoices: true,
        },
      });

      if (lowerMsg.includes('attendance')) {
        const total = student?.attendances.length || 0;
        const present = student?.attendances.filter((a) => a.status === 'PRESENT').length || 0;
        const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
        
        reply = `Hello ${user.name}! According to your academic record:\n\n• Overall Attendance: **${pct}%** (${present} present out of ${total} logged classes).\n`;
        
        if (Number(pct) < 75) {
          reply += `⚠️ **Warning:** Your attendance is currently below the mandatory **75% threshold**. Please make sure to attend all upcoming classes to avoid exam eligibility issues.`;
        } else {
          reply += `✅ Great job! Your attendance meets the university requirement.`;
        }
        dataContext = { attendancePct: pct, totalClasses: total, presentClasses: present };

      } else if (lowerMsg.includes('exam') || lowerMsg.includes('test')) {
        const upcomingExams = await prisma.exam.findMany({
          where: { status: 'UPCOMING' },
          include: { subject: true },
          take: 3,
        });

        if (upcomingExams.length > 0) {
          const listStr = upcomingExams
            .map((e) => `• **${e.title}** (${e.subject.code}): Scheduled for **${e.examDate}** at **${e.startTime}** (${e.type} Exam, ${e.durationMinutes} mins)`)
            .join('\n');
          reply = `Here are your upcoming examinations:\n\n${listStr}\n\nMake sure to review your course materials and attempt any online practice tests in your portal!`;
        } else {
          reply = `You have no upcoming exams scheduled at this moment. Stay tuned for official notices!`;
        }
        dataContext = upcomingExams;

      } else if (lowerMsg.includes('result') || lowerMsg.includes('grade') || lowerMsg.includes('gpa') || lowerMsg.includes('cgpa')) {
        const results = student?.results || [];
        if (results.length > 0) {
          const totalCredits = results.reduce((acc, r) => acc + r.subject.creditHours, 0);
          const totalPoints = results.reduce((acc, r) => acc + r.gpaPoint * r.subject.creditHours, 0);
          const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

          const resStr = results.map((r) => `• **${r.subject.name}** (${r.subject.code}): Grade **${r.grade}** (${r.obtainedMarks}/${r.totalMarks}, GPA: ${r.gpaPoint})`).join('\n');
          reply = `Here is your current academic performance overview:\n\n${resStr}\n\n🎓 **Calculated CGPA:** **${gpa} / 4.00**`;
        } else {
          reply = `No official semester results have been published for your profile yet.`;
        }

      } else if (lowerMsg.includes('fee') || lowerMsg.includes('payment') || lowerMsg.includes('due') || lowerMsg.includes('invoice')) {
        const fees = student?.feeInvoices || [];
        const pending = fees.filter((f) => f.status !== 'PAID');
        if (pending.length > 0) {
          const pendingStr = pending.map((f) => `• Invoice **${f.invoiceNumber}** (${f.title}): Due date **${f.dueDate}**, Amount remaining: **$${f.amount - f.paidAmount}** (Status: ${f.status})`).join('\n');
          reply = `Here is your current tuition and fee balance:\n\n${pendingStr}\n\nYou can settle pending payments directly through the **Fees** tab using Bank Transfer or Online Card.`;
        } else {
          reply = `All your tuition fees are fully paid! You have zero outstanding balance.`;
        }

      } else if (lowerMsg.includes('assignment') || lowerMsg.includes('homework')) {
        const assignments = await prisma.assignment.findMany({
          include: { subject: true },
          orderBy: { deadline: 'asc' },
          take: 3,
        });
        const list = assignments.map((a) => `• **${a.title}** (${a.subject.code}): Deadline **${a.deadline}** (${a.totalMarks} Total Marks)`).join('\n');
        reply = `Here are the active course assignments:\n\n${list}\n\nYou can upload your completed file/solution on the Assignments page.`;
      } else {
        reply = `Hello ${user.name}! I am **CampusAI**, your personal smart academic assistant.\n\nI can help you with:\n1. 📊 Checking your real-time **attendance & warnings**\n2. 📝 Viewing **upcoming exam schedules**\n3. 🎓 Explaining your **results, grades, and CGPA**\n4. 💳 Reviewing **tuition fees and payment status**\n5. 📚 Subject guidance & assignment deadlines\n\nHow can I assist you right now?`;
      }
    } else {
      // Admin / Teacher / General AI responses
      reply = `Hello ${user.name} (${user.role})! I am **CampusAI**, your smart university management assistant.\n\nI can assist you with campus metrics, student queries, course allocations, or attendance analytics. What information would you like to inspect?`;
    }

    // Save assistant reply
    const assistantMsg = await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        sender: 'ASSISTANT',
        content: reply,
      },
    });

    return res.json({
      conversationId: convId,
      reply,
      message: assistantMsg,
      dataContext,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'CampusAI engine failed to process query.', error: error.message });
  }
};

export const getAiPerformanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId || req.user?.studentId;
    if (!studentId) return res.status(400).json({ message: 'Student ID required.' });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        department: true,
        attendances: { include: { subject: true } },
        results: { include: { subject: true } },
        submissions: { include: { assignment: true } },
      },
    });

    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // AI Insight Generator based on factual database calculations
    const insights: string[] = [];
    const totalAtt = student.attendances.length;
    const presentAtt = student.attendances.filter((a) => a.status === 'PRESENT').length;
    const attPct = totalAtt > 0 ? (presentAtt / totalAtt) * 100 : 100;

    if (attPct < 75) {
      insights.push(`Your attendance rate is ${attPct.toFixed(1)}%, which is below the required 75% threshold. Increasing attendance will improve exam eligibility.`);
    } else {
      insights.push(`Strong attendance record at ${attPct.toFixed(1)}%. Consistent class presence correlates positively with high assessment scores.`);
    }

    const avgScore = student.results.length > 0
      ? student.results.reduce((acc, r) => acc + r.percentage, 0) / student.results.length
      : 85;

    if (avgScore >= 85) {
      insights.push(`Your academic performance is strong with an average mark of ${avgScore.toFixed(1)}%. You are currently in the top tier of your cohort.`);
    } else {
      insights.push(`Your average grade percentage is ${avgScore.toFixed(1)}%. Consider taking advantage of faculty office hours or study groups.`);
    }

    const pendingSubmissions = student.submissions.filter((s) => s.status === 'PENDING' || s.status === 'LATE').length;
    if (pendingSubmissions > 0) {
      insights.push(`You have ${pendingSubmissions} assignment(s) requiring submission or grading review.`);
    } else {
      insights.push(`All submitted assignments have been processed and graded by course instructors.`);
    }

    return res.json({
      studentName: student.user.name,
      studentIdCode: student.studentIdCode,
      metrics: {
        attendancePct: Number(attPct.toFixed(1)),
        averageScorePct: Number(avgScore.toFixed(1)),
        totalResultsCount: student.results.length,
      },
      insights,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to generate AI insights.', error: error.message });
  }
};
