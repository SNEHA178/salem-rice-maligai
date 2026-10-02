import { Router, Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { isDbConnected } from '../config/db';
import { dbManager } from '../db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

export const settingsRouter = Router();

const DEFAULT_SETTINGS = {
  storeName: 'Salem Rice & Maligai',
  phone: '8973203053',
  altPhone: '8946071718',
  address: 'Shevapet, Salem - 636002',
  monSatOpen: '07:00',
  monSatClose: '21:30',
  sunOpen: '07:00',
  sunClose: '14:00',
  salemOnly: true,
  allowedPincodes: [
    '636001', '636002', '636003', '636004', '636005',
    '636006', '636007', '636008', '636009', '636010',
    '636011', '636012', '636015', '636016', '636017',
    '636020', '636030', '636038', '636140'
  ],
  deliveryCharge: 0,
  freeDeliveryThreshold: 0,
  tomorrowDeliveryRule: true,
  shopStatus: 'OPEN',
  noticeEn: '',
  noticeTa: '',
  reopenDate: '',
};

// GET /api/settings - Public
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create(DEFAULT_SETTINGS);
      }
      return res.json(settings);
    } else {
      const local = await dbManager.getSettings();
      return res.json(local || DEFAULT_SETTINGS);
    }
  } catch (error: any) {
    console.error('[Settings API] Get error:', error.message);
    return res.json(DEFAULT_SETTINGS);
  }
});

// PUT or PATCH /api/settings - Admin Only
const updateSettingsHandler = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ ...DEFAULT_SETTINGS, ...updates });
      } else {
        Object.assign(settings, updates);
        await settings.save();
      }
      return res.json(settings);
    } else {
      const updated = await dbManager.updateSettings(updates);
      return res.json(updated);
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: PUT/PATCH\nURL: /api/settings\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

settingsRouter.put('/', requireAuth, requireAdmin, updateSettingsHandler);
settingsRouter.patch('/', requireAuth, requireAdmin, updateSettingsHandler);

export default settingsRouter;
