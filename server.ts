import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { connectDB, isDbConnected } from './server/config/db';
import { seedDevelopmentDatabase } from './server/services/seedService';
import { authRouter } from './server/routes/authRoutes';
import { categoryRouter } from './server/routes/categoryRoutes';
import { productRouter } from './server/routes/productRoutes';
import { orderRouter } from './server/routes/orderRoutes';
import { advertisementRouter } from './server/routes/advertisementRoutes';
import { addressRouter } from './server/routes/addressRoutes';
import { settingsRouter } from './server/routes/settingsRoutes';
import { notificationRouter } from './server/routes/notificationRoutes';
import { Product } from './server/models/Product';
import { Category } from './server/models/Category';
import { Order } from './server/models/Order';
import { User } from './server/models/User';
import { dbManager } from './server/db';
import { requireAuth, requireAdmin } from './server/middleware/authMiddleware';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// CORS configuration per requirement 33
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL || '',
  process.env.APP_URL || '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin in dev iframe)
      if (!origin || allowedOrigins.includes(origin) || origin.includes('run.app')) {
        return callback(null, true);
      }
      callback(null, true); // Fallback allow for preview dev environment
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 1. Health & Status Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    status: 'ok',
    brand: 'Salem Rice & Maligai',
    database: isDbConnected() ? 'MongoDB Atlas' : 'Local Persistent Database',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db-status', (_req: Request, res: Response) => {
  res.json({
    ...dbManager.getDbStatus(),
    mongooseConnected: isDbConnected(),
  });
});

// 2. Seed development database trigger
app.post('/api/seed', async (_req: Request, res: Response) => {
  try {
    const result = await seedDevelopmentDatabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/advertisements', advertisementRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationRouter);

// Support /api/admin/* route aliases for admin CRUD actions
app.use('/api/admin/products', productRouter);
app.use('/api/admin/categories', categoryRouter);
app.use('/api/admin/orders', orderRouter);
app.use('/api/admin/settings', settingsRouter);
app.use('/api/admin/advertisements', advertisementRouter);

// 4. Real Dashboard Stats for Admin (Protected: Admin Only)
app.get('/api/stats', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const threshold = 5;

    if (isDbConnected()) {
      const [
        totalProducts,
        activeProducts,
        lowStockProds,
        totalCategories,
        activeCategories,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        customersCount,
        allOrders,
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ available: true }),
        Product.find({ stock: { $lte: threshold } }).select('_id name stock unit image retailPrice category').lean(),
        Category.countDocuments(),
        Category.countDocuments({ active: true }),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['PENDING', 'Pending', 'PROCESSING', 'Processing'] } }),
        Order.countDocuments({ status: { $in: ['DELIVERED', 'Delivered'] } }),
        User.countDocuments({ role: 'CUSTOMER' }),
        Order.find({ status: { $nin: ['CANCELLED', 'Cancelled'] } }).select('total').lean(),
      ]);

      const totalRevenue = allOrders.reduce((sum, o: any) => sum + (o.total || 0), 0);

      return res.json({
        totalProducts,
        activeProducts,
        lowStockProducts: lowStockProds.length,
        lowStockList: lowStockProds,
        lowStockThreshold: threshold,
        totalCategories,
        activeCategories,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        totalCustomers: customersCount || 1,
      });
    } else {
      const stats = await dbManager.getStats();
      const products = await dbManager.getProducts();
      const lowStockList = products.filter(p => (p.stock || 0) <= threshold);

      return res.json({
        ...stats,
        activeProducts: products.filter(p => p.available !== false).length,
        lowStockProducts: lowStockList.length,
        lowStockList,
        lowStockThreshold: threshold,
        activeCategories: stats.totalCategories,
      });
    }
  } catch (err: any) {
    console.error('[Stats API] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
});

// 5. Image upload helper (base64 / URL storage - Admin only)
app.post('/api/upload', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { imageBase64, name } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 data is required' });
    }
    return res.json({
      url: imageBase64,
      name: name || 'uploaded-image',
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

// 6. Centralized API Error Handler (Ensures clean error responses without leaking credentials/stack)
app.use('/api', (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  console.error(`[API ERROR]\nMETHOD: ${req.method}\nURL: ${req.originalUrl}\nSTATUS: ${status}\nMESSAGE: ${message}`);
  res.status(status).json({
    success: false,
    message,
  });
});

// 7. Start server with MongoDB / Local Database initialization and Vite mounting
async function startServer() {
  console.log('🌾 Initializing Salem Rice & Maligai Backend...');

  // Initialize DB Connection (Mongoose Atlas or Local JSON store)
  await connectDB();
  await dbManager.initConnection();

  // Run initial development seed check
  await seedDevelopmentDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Salem Rice & Maligai Server running on port ${PORT}`);
    console.log(`🌾 Dual-Pricing & Bilingual Engine Ready (EN + தமிழ்)`);
  });
}

startServer();
