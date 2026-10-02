import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { dbManager } from '../db';
import { isDbConnected } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

export const productRouter = Router();

// GET /api/products - Supports category, featured, search, available
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, available } = req.query;

    if (isDbConnected()) {
      const filter: any = {};

      // Filter by category
      if (category && category !== 'all' && category !== 'ALL') {
        // Find category by name or ID
        const catDoc = await Category.findOne({
          $or: [
            { 'name.en': new RegExp(`^${category}$`, 'i') },
            { 'name.ta': new RegExp(`^${category}$`, 'i') },
          ],
        });

        if (catDoc) {
          filter.$or = [{ category: catDoc._id }, { category: category }, { categoryName: catDoc.name.en }];
        } else {
          filter.$or = [{ category: category }, { categoryName: category }];
        }
      }

      // Filter by featured
      if (featured === 'true') {
        filter.featured = true;
      }

      // Filter by available
      if (available === 'true') {
        filter.available = true;
      }

      // Bilingual Search (English, Tamil, Category)
      if (search && typeof search === 'string' && search.trim()) {
        const queryTerm = search.trim();
        const searchRegex = new RegExp(queryTerm, 'i');

        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { 'name.en': searchRegex },
            { 'name.ta': searchRegex },
            { 'description.en': searchRegex },
            { 'description.ta': searchRegex },
            { categoryName: searchRegex },
          ],
        });
      }

      const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
      return res.json(products);
    } else {
      // Local Database Manager
      const products = await dbManager.getProducts({
        category: category as string,
        search: search as string,
        featured: featured === 'true',
      });
      return res.json(products);
    }
  } catch (error: any) {
    console.error('[Products API] Query error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load products right now.',
    });
  }
});

// GET /api/products/:id
productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json(product);
    } else {
      const product = await dbManager.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json(product);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve product.' });
  }
});

// POST /api/products - Admin only
productRouter.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      categoryName,
      image,
      retailPrice,
      wholesalePrice,
      unit,
      stock,
      available,
      featured,
      wholesaleMinimumQuantity,
    } = req.body;

    if (!name || retailPrice === undefined || wholesalePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name, retailPrice, and wholesalePrice are required.',
      });
    }

    if (Number(retailPrice) <= 0 || Number(wholesalePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Retail price and wholesale price must be greater than zero.',
      });
    }

    const localizedName =
      typeof name === 'object'
        ? { en: name.en || '', ta: name.ta || name.en || '' }
        : { en: name, ta: req.body.tamilName || name };

    const localizedDesc =
      typeof description === 'object'
        ? { en: description.en || '', ta: description.ta || '' }
        : { en: description || '', ta: description || '' };

    const localizedUnit =
      typeof unit === 'object'
        ? { en: unit.en || 'kg', ta: unit.ta || 'கிலோ' }
        : { en: unit || 'kg', ta: unit === 'kg' ? 'கிலோ' : unit || 'கிலோ' };

    if (isDbConnected()) {
      const newProduct = await Product.create({
        name: localizedName,
        description: localizedDesc,
        category: category || 'Salem Rice',
        categoryName: categoryName || (typeof category === 'string' ? category : 'Salem Rice'),
        image:
          image ||
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        unit: localizedUnit,
        stock: stock !== undefined ? Number(stock) : 50,
        available: available !== undefined ? Boolean(available) : true,
        featured: Boolean(featured),
        wholesaleMinimumQuantity:
          wholesaleMinimumQuantity !== undefined && wholesaleMinimumQuantity !== null && wholesaleMinimumQuantity !== ''
            ? Number(wholesaleMinimumQuantity)
            : 4,
      });

      return res.status(201).json(newProduct);
    } else {
      const newProduct = await dbManager.addProduct({
        name: localizedName.en,
        tamilName: localizedName.ta,
        description: localizedDesc.en,
        category: typeof category === 'string' ? category : 'Salem Rice',
        image:
          image ||
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        unit: localizedUnit.en,
        stock: stock !== undefined ? Number(stock) : 50,
        available: available !== undefined ? Boolean(available) : true,
        featured: Boolean(featured),
        wholesaleMinimumQuantity:
          wholesaleMinimumQuantity !== undefined && wholesaleMinimumQuantity !== null && wholesaleMinimumQuantity !== ''
            ? Number(wholesaleMinimumQuantity)
            : 4,
      });

      return res.status(201).json(newProduct);
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: POST\nURL: /api/products\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create product.' });
  }
});

// PUT or PATCH /api/products/:id - Admin only
const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid product ID is required.' });
    }

    if (isDbConnected()) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Product.findByIdAndUpdate(id, updates, { new: true });
      }
      if (!updated) {
        updated = await Product.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
      }
      if (!updated) {
        updated = await dbManager.updateProduct(id, updates);
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json(updated);
    } else {
      const updated = await dbManager.updateProduct(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json(updated);
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: PUT/PATCH\nURL: /api/products/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update product.' });
  }
};

productRouter.put('/:id', requireAuth, requireAdmin, updateProductHandler);
productRouter.patch('/:id', requireAuth, requireAdmin, updateProductHandler);

// DELETE /api/products/:id - Admin only
productRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Valid product ID is required.' });
    }

    if (isDbConnected()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findByIdAndUpdate(id, { available: false }, { new: true });
      }
      if (!product) {
        product = await Product.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { available: false }, { new: true });
      }
      if (!product) {
        product = await dbManager.updateProduct(id, { available: false });
      }
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json({ success: true, message: 'Product marked as unavailable.' });
    } else {
      await dbManager.updateProduct(id, { available: false });
      return res.json({ success: true, message: 'Product marked as unavailable.' });
    }
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: DELETE\nURL: /api/products/${req.params.id}\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete product.' });
  }
});

export default productRouter;
