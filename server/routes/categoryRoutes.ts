import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { dbManager } from '../db';
import { isDbConnected } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

export const categoryRouter = Router();

// GET /api/categories - Categories with real dynamic product counts
categoryRouter.get('/', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.all === 'true';

    if (isDbConnected()) {
      const filter = includeInactive ? {} : { active: true };
      const categories = await Category.find(filter).sort({ createdAt: 1 }).lean();

      // Compute real product counts for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (cat: any) => {
          const count = await Product.countDocuments({
            $or: [
              { category: cat._id },
              { category: cat.name?.en },
              { categoryName: cat.name?.en },
            ],
          });
          return {
            ...cat,
            productCount: count,
          };
        })
      );

      return res.json(categoriesWithCount);
    } else {
      const categories = await dbManager.getCategories();
      const products = await dbManager.getProducts();
      const filtered = includeInactive ? categories : categories.filter((c) => c.active !== false);

      const categoriesWithCount = filtered.map(cat => {
        const catName = typeof cat.name === 'object' && cat.name ? (cat.name as any).en : String(cat.name || '');
        const count = products.filter(p => {
          const pCat = typeof p.category === 'object' && p.category ? (p.category as any).en : String(p.category || '');
          return pCat === catName || pCat === (cat as any)._id || pCat === (cat as any).id;
        }).length;
        return {
          ...cat,
          productCount: count,
        };
      });

      return res.json(categoriesWithCount);
    }
  } catch (error: any) {
    console.error('[Categories API] Fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load categories right now.',
    });
  }
});

// GET /api/categories/:id
categoryRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json(category);
    } else {
      const categories = await dbManager.getCategories();
      const category = categories.find((c: any) => c._id === id || c.id === id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json(category);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve category.' });
  }
});

// POST /api/categories - Admin only
categoryRouter.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, image, active, tamilName } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    // Format bilingual name
    const localizedName =
      typeof name === 'object'
        ? { en: name.en || 'New Category', ta: name.ta || name.en || 'புதிய பிரிவு' }
        : { en: name, ta: tamilName || name };

    const localizedDesc =
      typeof description === 'object'
        ? { en: description.en || '', ta: description.ta || '' }
        : { en: description || '', ta: description || '' };

    if (isDbConnected()) {
      const newCategory = await Category.create({
        name: localizedName,
        description: localizedDesc,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        active: active !== undefined ? active : true,
      });
      return res.status(201).json(newCategory);
    } else {
      const newCategory = await dbManager.addCategory({
        name: localizedName.en,
        tamilName: localizedName.ta,
        description: localizedDesc.en,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        active: active !== undefined ? active : true,
      });
      return res.status(201).json(newCategory);
    }
  } catch (error: any) {
    console.error('[Categories API] Create error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id - Admin only
categoryRouter.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid category ID is required.' });
    }

    if (isDbConnected()) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Category.findByIdAndUpdate(id, updates, { new: true });
      }
      if (!updated) {
        updated = await Category.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
      }
      if (!updated) {
        updated = await dbManager.updateCategory(id, updates);
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json(updated);
    } else {
      const updated = await dbManager.updateCategory(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json(updated);
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: PUT\nURL: /api/categories/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id - Admin only (Soft delete: active = false per spec)
categoryRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid category ID is required.' });
    }

    if (isDbConnected()) {
      let category = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        category = await Category.findByIdAndUpdate(id, { active: false }, { new: true });
      }
      if (!category) {
        category = await Category.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { active: false }, { new: true });
      }
      if (!category) {
        category = await dbManager.updateCategory(id, { active: false });
      }
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json({ success: true, message: 'Category archived successfully.' });
    } else {
      await dbManager.updateCategory(id, { active: false });
      return res.json({ success: true, message: 'Category archived successfully.' });
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: DELETE\nURL: /api/categories/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete category.' });
  }
});

export default categoryRouter;
