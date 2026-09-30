import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        registrations: { include: { student: { include: { user: { select: { name: true, email: true } } } } } },
        _count: { select: { registrations: true } },
      },
      orderBy: { date: 'asc' },
    });
    return res.json({ events });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch campus events.', error: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, time, location, organizer, maxCapacity, imageUrl } = req.body;
    if (!title || !date || !time || !location) {
      return res.status(400).json({ message: 'Title, date, time, and location are required.' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date,
        time,
        location,
        organizer: organizer || 'Campus Administration',
        maxCapacity: maxCapacity ? Number(maxCapacity) : 100,
        imageUrl: imageUrl || null,
      },
    });

    await logAudit(req.user?.id, 'CREATE_EVENT', 'Event', `Created campus event ${title}`);
    return res.status(201).json({ message: 'Event created successfully.', event });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create event.', error: error.message });
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user?.studentId;

    if (!studentId) return res.status(400).json({ message: 'Only students can register for events.' });

    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { registrations: true } } } });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event._count.registrations >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event is fully booked.' });
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventId, studentId },
    });

    await logAudit(req.user?.id, 'REGISTER_EVENT', 'EventRegistration', `Registered student ${studentId} for event ${event.title}`);
    return res.json({ message: 'Registered for event successfully.', registration });
  } catch (error: any) {
    return res.status(500).json({ message: 'Registration failed or already registered.', error: error.message });
  }
};
