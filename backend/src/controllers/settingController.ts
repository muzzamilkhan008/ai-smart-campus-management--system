import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: {} });
    }
    return res.json({ settings });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch system settings.', error: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { institutionName, institutionLogo, academicYear, currentSemester, attendanceThreshold, currency, gradingSystem, theme } = req.body;
    let settings = await prisma.systemSetting.findFirst();

    if (!settings) {
      settings = await prisma.systemSetting.create({ data: {} });
    }

    const updated = await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        institutionName: institutionName !== undefined ? institutionName : settings.institutionName,
        institutionLogo: institutionLogo !== undefined ? institutionLogo : settings.institutionLogo,
        academicYear: academicYear !== undefined ? academicYear : settings.academicYear,
        currentSemester: currentSemester !== undefined ? currentSemester : settings.currentSemester,
        attendanceThreshold: attendanceThreshold !== undefined ? Number(attendanceThreshold) : settings.attendanceThreshold,
        currency: currency !== undefined ? currency : settings.currency,
        gradingSystem: gradingSystem !== undefined ? gradingSystem : settings.gradingSystem,
        theme: theme !== undefined ? theme : settings.theme,
      },
    });

    await logAudit(req.user?.id, 'UPDATE_SETTINGS', 'SystemSetting', 'Updated institution settings');
    return res.json({ message: 'System settings updated successfully.', settings: updated });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update system settings.', error: error.message });
  }
};
