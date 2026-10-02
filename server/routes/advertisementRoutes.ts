import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Advertisement } from '../models/Advertisement';
import { dbManager } from '../db';
import { isDbConnected } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

export const advertisementRouter = Router();

// GET /api/advertisements - Customer gets active & non-expired, Admin with ?all=true gets all
advertisementRouter.get('/', async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === 'true';
    const now = new Date();

    if (isDbConnected()) {
      let filter: any = {};
      if (!includeAll) {
        filter = {
          active: true,
          $and: [
            { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
            { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
          ],
        };
      }
      const ads = await Advertisement.find(filter).sort({ displayOrder: 1, createdAt: -1 });
      return res.json(ads);
    } else {
      const ads = await dbManager.getAdvertisements(!includeAll);
      return res.json(ads);
    }
  } catch (error: any) {
    console.error('[Ads API] Fetch error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load advertisements.' });
  }
});

// GET /api/advertisements/:id
advertisementRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const ad = await Advertisement.findById(id);
      if (!ad) {
        return res.status(404).json({ success: false, message: 'Advertisement not found.' });
      }
      return res.json(ad);
    } else {
      const ads = await dbManager.getAdvertisements(false);
      const ad = ads.find((a: any) => a._id === id || a.id === id);
      if (!ad) {
        return res.status(404).json({ success: false, message: 'Advertisement not found.' });
      }
      return res.json(ad);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve advertisement.' });
  }
});

// POST /api/advertisements - Admin only
advertisementRouter.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      linkCategory,
      badge,
      active,
      displayOrder,
      startDate,
      endDate,
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required.' });
    }

    const localizedTitle =
      typeof title === 'object'
        ? { en: title.en || '', ta: title.ta || title.en || '' }
        : { en: title, ta: req.body.tamilTitle || title };

    const localizedSub =
      typeof subtitle === 'object'
        ? { en: subtitle.en || '', ta: subtitle.ta || '' }
        : { en: subtitle || '', ta: '' };

    const localizedCta =
      typeof ctaText === 'object'
        ? { en: ctaText.en || 'Shop Now', ta: ctaText.ta || 'இப்போதே வாங்குங்கள்' }
        : { en: ctaText || 'Shop Now', ta: 'இப்போதே வாங்குங்கள்' };

    const adData = {
      title: localizedTitle,
      subtitle: localizedSub,
      image,
      ctaText: localizedCta,
      ctaLink: ctaLink || '/products',
      linkCategory: linkCategory || 'Salem Rice',
      badge: badge || 'Special Offer',
      active: active !== undefined ? Boolean(active) : true,
      displayOrder: Number(displayOrder) || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    if (isDbConnected()) {
      const newAd = await Advertisement.create(adData);
      return res.status(201).json(newAd);
    } else {
      const newAd = await dbManager.addAdvertisement({
        title: localizedTitle.en,
        tamilTitle: localizedTitle.ta,
        subtitle: localizedSub.en,
        image,
        linkCategory: linkCategory || 'Salem Rice',
        badge: badge || 'Special Offer',
        active: active !== undefined ? Boolean(active) : true,
      } as any);
      return res.status(201).json(newAd);
    }
  } catch (error: any) {
    console.error('[Ads API] Create error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create advertisement.' });
  }
});

// PUT /api/advertisements/:id - Admin only
advertisementRouter.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid advertisement ID is required.' });
    }

    if (isDbConnected()) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Advertisement.findByIdAndUpdate(id, updates, { new: true });
      }
      if (!updated) {
        updated = await Advertisement.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
      }
      if (!updated) {
        updated = await dbManager.updateAdvertisement(id, updates);
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Advertisement not found.' });
      }
      return res.json(updated);
    } else {
      const updated = await dbManager.updateAdvertisement(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Advertisement not found.' });
      }
      return res.json(updated);
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: PUT\nURL: /api/advertisements/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update advertisement.' });
  }
});

// DELETE /api/advertisements/:id - Admin only
advertisementRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid advertisement ID is required.' });
    }

    if (isDbConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Advertisement.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Advertisement.findOneAndDelete({ $or: [{ _id: id }, { id }] });
      }
      if (!deleted) {
        await dbManager.updateAdvertisement(id, { active: false });
      }
      return res.json({ success: true, message: 'Advertisement deleted successfully.' });
    } else {
      await dbManager.updateAdvertisement(id, { active: false });
      return res.json({ success: true, message: 'Advertisement deleted successfully.' });
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: DELETE\nURL: /api/advertisements/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete advertisement.' });
  }
});

export default advertisementRouter;
