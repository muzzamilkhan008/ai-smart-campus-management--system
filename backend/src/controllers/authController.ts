import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername },
        ],
      },
      include: {
        studentProfile: true,
        teacherProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact administrator.' });
    }

    const secret = process.env.JWT_SECRET || 'ai_smart_campus_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    await logAudit(user.id, 'LOGIN', 'User', `User ${user.email} logged in successfully`);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        studentId: user.studentProfile?.id,
        teacherId: user.teacherProfile?.id,
        staffId: user.staffProfile?.id,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields (name, email, username, password) are required.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role && ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'].includes(role) ? role : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        username,
        passwordHash,
        role: assignedRole,
      },
    });

    // Automatically create profile if STUDENT or TEACHER
    if (assignedRole === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          studentIdCode: `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        },
      });
    } else if (assignedRole === 'TEACHER') {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          teacherIdCode: `TCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        },
      });
    }

    await logAudit(user.id, 'REGISTER', 'User', `New user registered: ${user.email} (${assignedRole})`);

    const secret = process.env.JWT_SECRET || 'ai_smart_campus_super_secret_jwt_key_2026';
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email address is required.' });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    // Standard secure response
    return res.json({ message: 'If an account exists with this email, password reset instructions have been sent.' });
  }

  await logAudit(user.id, 'FORGOT_PASSWORD_REQUEST', 'User', `Password reset requested for ${email}`);
  return res.json({
    message: 'Password reset link sent to your email (Demo mode: reset token generated).',
    demoToken: `reset-${user.id}-${Date.now()}`,
  });
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await logAudit(user.id, 'RESET_PASSWORD', 'User', `Password updated for ${email}`);
  return res.json({ message: 'Password reset successful. You may now log in.' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: {
          include: {
            department: true,
            program: true,
          },
        },
        teacherProfile: {
          include: {
            department: true,
          },
        },
        staffProfile: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: 'Profile not found.' });

    const { passwordHash, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
    });

    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
};
