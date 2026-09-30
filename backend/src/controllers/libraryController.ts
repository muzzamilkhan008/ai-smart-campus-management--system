import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category } = req.query;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { author: { contains: String(search) } },
        { isbn: { contains: String(search) } },
        { bookCode: { contains: String(search) } },
      ];
    }
    if (category) where.category = String(category);

    const books = await prisma.book.findMany({
      where,
      include: {
        issues: {
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { title: 'asc' },
    });

    return res.json({ books });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch library books.', error: error.message });
  }
};

export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, category, isbn, quantity } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ message: 'Title, author, and ISBN are required.' });
    }

    const qty = quantity ? Number(quantity) : 1;
    const bookCount = await prisma.book.count();
    const bookCode = `BK-${100 + bookCount + 1}`;

    const book = await prisma.book.create({
      data: {
        bookCode,
        title,
        author,
        category: category || 'General',
        isbn,
        quantity: qty,
        availableCopies: qty,
      },
    });

    await logAudit(req.user?.id, 'CREATE_BOOK', 'Book', `Added book ${title} (${bookCode})`);
    return res.status(201).json({ message: 'Book added successfully.', book });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to add book.', error: error.message });
  }
};

export const issueBook = async (req: AuthRequest, res: Response) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    if (!bookId || !studentId) return res.status(400).json({ message: 'bookId and studentId required.' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing.' });
    }

    const defaultDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const issue = await prisma.bookIssue.create({
      data: {
        bookId,
        studentId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: defaultDueDate,
        status: 'ISSUED',
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: book.availableCopies - 1 },
    });

    await logAudit(req.user?.id, 'ISSUE_BOOK', 'BookIssue', `Issued book ${book.bookCode} to student ${studentId}`);
    return res.json({ message: 'Book issued successfully.', issue });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to issue book.', error: error.message });
  }
};

export const returnBook = async (req: AuthRequest, res: Response) => {
  try {
    const { issueId } = req.params;
    const issue = await prisma.bookIssue.findUnique({ where: { id: issueId }, include: { book: true } });
    if (!issue) return res.status(404).json({ message: 'Book issue record not found.' });

    const today = new Date().toISOString().split('T')[0];
    let fineAmount = 0;
    if (new Date(today) > new Date(issue.dueDate)) {
      const diffTime = Math.abs(new Date(today).getTime() - new Date(issue.dueDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 2.0; // $2 fine per overdue day
    }

    const updatedIssue = await prisma.bookIssue.update({
      where: { id: issueId },
      data: {
        returnDate: today,
        status: 'RETURNED',
        fineAmount,
      },
    });

    await prisma.book.update({
      where: { id: issue.bookId },
      data: { availableCopies: issue.book.availableCopies + 1 },
    });

    await logAudit(req.user?.id, 'RETURN_BOOK', 'BookIssue', `Returned book ${issue.book.bookCode}. Fine: $${fineAmount}`);
    return res.json({ message: 'Book returned successfully.', issue: updatedIssue });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to return book.', error: error.message });
  }
};
