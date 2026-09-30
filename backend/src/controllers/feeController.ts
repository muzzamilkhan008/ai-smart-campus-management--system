import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getFees = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, status } = req.query;
    const where: any = {};

    if (studentId) where.studentId = String(studentId);
    if (status) where.status = String(status);

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalPending = fees.reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);
    const totalOverdue = fees.filter(f => f.status === 'OVERDUE').reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    return res.json({
      fees,
      overview: {
        totalCollected,
        totalPending,
        totalOverdue,
        totalInvoices: fees.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch fees.', error: error.message });
  }
};

export const createFeeInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, title, amount, dueDate } = req.body;
    if (!studentId || !title || !amount || !dueDate) {
      return res.status(400).json({ message: 'studentId, title, amount, and dueDate are required.' });
    }

    const feeCount = await prisma.fee.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(feeCount + 1).padStart(3, '0')}`;

    const fee = await prisma.fee.create({
      data: {
        invoiceNumber,
        studentId,
        title,
        amount: Number(amount),
        dueDate,
        status: 'PENDING',
      },
      include: { student: { include: { user: true } } },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: fee.student.userId,
        title: 'New Fee Invoice Generated',
        message: `Invoice ${invoiceNumber} for "${title}" ($${amount}) has been generated. Due date: ${dueDate}.`,
        type: 'FEE',
      },
    });

    await logAudit(req.user?.id, 'CREATE_FEE', 'Fee', `Created invoice ${invoiceNumber} for student ${studentId}`);
    return res.status(201).json({ message: 'Fee invoice created successfully.', fee });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create fee invoice.', error: error.message });
  }
};

export const recordFeePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { feeId } = req.params;
    const { amountPaid, paymentMethod, transactionId } = req.body;

    if (!amountPaid || !paymentMethod) {
      return res.status(400).json({ message: 'amountPaid and paymentMethod are required.' });
    }

    const fee = await prisma.fee.findUnique({ where: { id: feeId }, include: { student: true } });
    if (!fee) return res.status(404).json({ message: 'Fee invoice not found.' });

    const newPaidAmount = fee.paidAmount + Number(amountPaid);
    const newStatus = newPaidAmount >= fee.amount ? 'PAID' : 'PARTIAL';

    const paymentCount = await prisma.feePayment.count();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(3, '0')}`;

    const payment = await prisma.feePayment.create({
      data: {
        feeId,
        receiptNumber,
        amountPaid: Number(amountPaid),
        paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });

    await prisma.fee.update({
      where: { id: feeId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    await logAudit(req.user?.id, 'RECORD_PAYMENT', 'FeePayment', `Recorded payment of $${amountPaid} for receipt ${receiptNumber}`);

    return res.json({
      message: 'Payment recorded successfully.',
      payment,
      receipt: {
        receiptNumber,
        invoiceNumber: fee.invoiceNumber,
        studentName: fee.student.id,
        amountPaid,
        balanceRemaining: fee.amount - newPaidAmount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to record payment.', error: error.message });
  }
};
