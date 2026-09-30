import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { type, studentId } = req.query;
    const where: any = {};

    if (type) where.type = String(type);
    if (studentId) where.studentId = String(studentId);

    // If student, only view public documents or their own
    if (req.user?.role === 'STUDENT') {
      where.OR = [
        { studentId: req.user.studentId },
        { studentId: null },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: { select: { name: true, role: true } },
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ documents });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch documents.', error: error.message });
  }
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, fileUrl, studentId } = req.body;
    if (!title || !type || !fileUrl) {
      return res.status(400).json({ message: 'Title, type, and fileUrl are required.' });
    }

    const document = await prisma.document.create({
      data: {
        title,
        type,
        fileUrl,
        uploadedById: req.user!.id,
        studentId: studentId || null,
      },
    });

    await logAudit(req.user?.id, 'UPLOAD_DOCUMENT', 'Document', `Uploaded document ${title}`);
    return res.status(201).json({ message: 'Document uploaded successfully.', document });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to upload document.', error: error.message });
  }
};
