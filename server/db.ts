import { MongoClient, Db, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Category,
  Product,
  Advertisement,
  Order,
  User,
  DashboardStats,
  DbStatus,
  OrderStatus
} from '../src/types.ts';

export const DEFAULT_STORE_SETTINGS = {
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

export function getInitialAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@salemrice.com').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_SECRET || 'salemadmin2026').trim();
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  const now = new Date().toISOString();

  return {
    _id: 'usr_admin_1',
    name: 'Store Manager',
    email: adminEmail,
    phone: '8973203053',
    role: 'ADMIN' as const,
    passwordHash,
    address: 'Shevapet, Salem - 636002',
    city: 'Salem',
    pincode: '636002',
    businessName: 'Salem Rice & Maligai',
    createdAt: now,
    updatedAt: now,
  };
}

interface LocalDatabase {
  categories: Category[];
  products: Product[];
  advertisements: Advertisement[];
  orders: Order[];
  users: (User & { passwordHash: string })[];
  settings?: any;
  notifications?: any[];
}

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isMongoConnected = false;
  private dataDir = path.resolve(process.cwd(), 'data');
  private dataFile = path.resolve(process.cwd(), 'data', 'salem_db.json');
  private localData: LocalDatabase = {
    categories: [],
    products: [],
    advertisements: [],
    orders: [],
    users: [],
  };

  constructor() {
    this.initLocalStore();
  }

  private initLocalStore() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        this.localData = JSON.parse(raw);
        if (this.localData.products && Array.isArray(this.localData.products)) {
          let modified = false;
          this.localData.products = this.localData.products.map(p => {
            if (p.wholesaleMinimumQuantity === undefined || p.wholesaleMinimumQuantity === null) {
              modified = true;
              return { ...p, wholesaleMinimumQuantity: 4 };
            }
            return p;
          });
          if (modified) {
            this.persistLocalStore();
          }
        }
      } else {
        const now = new Date().toISOString();
        const adminUser = getInitialAdminUser();
        this.localData = {
          categories: [],
          products: [],
          advertisements: [],
          orders: [],
          notifications: [],
          users: [adminUser],
          settings: {
            ...DEFAULT_STORE_SETTINGS,
            updatedAt: now,
          },
        };
        this.persistLocalStore();
      }
    } catch (err) {
      console.error('Failed to initialize local data store:', err);
    }
  }

  private persistLocalStore() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist local store:', err);
    }
  }

  public async initConnection(): Promise<void> {
    const rawUri = process.env.MONGODB_URI?.trim() || '';
    // Strip surrounding quotes if present (e.g. '""' or "''")
    const mongoUri = rawUri.replace(/^["']|["']$/g, '').trim();

    // Check if empty or known placeholder
    const isPlaceholder =
      !mongoUri ||
      mongoUri === 'MY_MONGODB_URI' ||
      mongoUri === 'undefined' ||
      mongoUri === 'null';

    if (isPlaceholder) {
      console.log('ℹ️ MONGODB_URI not set or left as placeholder. Running with durable storage engine.');
      this.isMongoConnected = false;
      return;
    }

    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      console.log('ℹ️ MONGODB_URI does not start with mongodb:// or mongodb+srv://. Running with durable storage engine.');
      this.isMongoConnected = false;
      return;
    }

    try {
      console.log('Connecting to MongoDB Atlas...');
      this.client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await this.client.connect();
      this.db = this.client.db('salem_rice_maligai');
      this.isMongoConnected = true;
      console.log('✅ Successfully connected to MongoDB Atlas (salem_rice_maligai)');

      await this.seedMongoIfEmpty();
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas connection attempt failed:', err.message);
      console.log('Falling back safely to durable persistent storage.');
      this.isMongoConnected = false;
    }
  }

  private async seedMongoIfEmpty() {
    if (!this.db) return;
    try {
      const adminCount = await this.db.collection('users').countDocuments({ role: 'ADMIN' });
      if (adminCount === 0) {
        const adminUser = getInitialAdminUser();
        await this.db.collection('users').insertOne(adminUser as any);
      }

      const settingsCount = await this.db.collection('settings').countDocuments();
      if (settingsCount === 0) {
        await this.db.collection('settings').insertOne({
          ...DEFAULT_STORE_SETTINGS,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error during initial Mongo check:', err);
    }
  }

  public async resetToCleanDatabase(): Promise<void> {
    const adminUser = getInitialAdminUser();
    const now = new Date().toISOString();
    this.localData = {
      categories: [],
      products: [],
      advertisements: [],
      orders: [],
      notifications: [],
      users: [adminUser],
      settings: {
        ...DEFAULT_STORE_SETTINGS,
        updatedAt: now,
      },
    };
    this.persistLocalStore();

    if (this.isMongoConnected && this.db) {
      await this.db.collection('products').deleteMany({});
      await this.db.collection('categories').deleteMany({});
      await this.db.collection('advertisements').deleteMany({});
      await this.db.collection('orders').deleteMany({});
      await this.db.collection('notifications').deleteMany({});
      await this.db.collection('users').deleteMany({ role: { $ne: 'ADMIN' } });
      const adminCount = await this.db.collection('users').countDocuments({ role: 'ADMIN' });
      if (adminCount === 0) {
        await this.db.collection('users').insertOne(adminUser as any);
      }
      const settingsCount = await this.db.collection('settings').countDocuments();
      if (settingsCount === 0) {
        await this.db.collection('settings').insertOne({
          ...DEFAULT_STORE_SETTINGS,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  public getDbStatus(): DbStatus {
    if (this.isMongoConnected) {
      return {
        connected: true,
        type: 'mongodb_atlas',
        databaseName: 'salem_rice_maligai',
        message: 'Connected to live MongoDB Atlas cluster.',
      };
    }
    return {
      connected: true,
      type: 'local_durable_store',
      databaseName: 'salem_db.json',
      message: 'Running in high-performance local durable mode. Set MONGODB_URI to connect to your Atlas cluster anytime.',
    };
  }

  // --- CATEGORIES ---
  public async getCategories(): Promise<Category[]> {
    if (this.isMongoConnected && this.db) {
      const docs = await this.db.collection('categories').find({}).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() } as unknown as Category));
    }
    return this.localData.categories;
  }

  public async addCategory(cat: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('categories').insertOne({
        ...cat,
        createdAt: now,
        updatedAt: now,
      });
      return { ...cat, _id: res.insertedId.toString(), createdAt: now, updatedAt: now };
    }

    const newCat: Category = {
      ...cat,
      _id: `cat_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.localData.categories.push(newCat);
    this.persistLocalStore();
    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      await this.db.collection('categories').updateOne(filter, {
        $set: { ...updates, updatedAt: now }
      });
      const doc = await this.db.collection('categories').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Category) : null;
    }

    const index = this.localData.categories.findIndex(c => c._id === id);
    if (index === -1) return null;
    this.localData.categories[index] = {
      ...this.localData.categories[index],
      ...updates,
      updatedAt: now,
    };
    this.persistLocalStore();
    return this.localData.categories[index];
  }

  public async deleteCategory(id: string): Promise<boolean> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      const res = await this.db.collection('categories').deleteOne(filter);
      return res.deletedCount > 0;
    }

    const initialLen = this.localData.categories.length;
    this.localData.categories = this.localData.categories.filter(c => c._id !== id);
    this.persistLocalStore();
    return this.localData.categories.length < initialLen;
  }

  // --- PRODUCTS ---
  public async getProducts(filters?: { category?: string; search?: string; featured?: boolean }): Promise<Product[]> {
    let products: Product[] = [];
    if (this.isMongoConnected && this.db) {
      const query: any = {};
      if (filters?.category) query.category = filters.category;
      if (filters?.featured !== undefined) query.featured = filters.featured;
      if (filters?.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { tamilName: { $regex: filters.search, $options: 'i' } },
        ];
      }
      const docs = await this.db.collection('products').find(query).toArray();
      products = docs.map(d => ({ ...d, _id: d._id.toString() } as unknown as Product));
    } else {
      products = [...this.localData.products];
      if (filters?.category) {
        products = products.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.featured !== undefined) {
        products = products.filter(p => p.featured === filters.featured);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        products = products.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.tamilName && p.tamilName.toLowerCase().includes(q))
        );
      }
    }
    return products;
  }

  public async getProductById(id: string): Promise<Product | null> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      const doc = await this.db.collection('products').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Product) : null;
    }
    return this.localData.products.find(p => p._id === id) || null;
  }

  public async addProduct(prod: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('products').insertOne({
        ...prod,
        createdAt: now,
        updatedAt: now,
      });
      return { ...prod, _id: res.insertedId.toString(), createdAt: now, updatedAt: now };
    }

    const newProd: Product = {
      ...prod,
      _id: `prod_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.localData.products.unshift(newProd);
    this.persistLocalStore();
    return newProd;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      await this.db.collection('products').updateOne(filter, {
        $set: { ...updates, updatedAt: now }
      });
      const doc = await this.db.collection('products').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Product) : null;
    }

    const idx = this.localData.products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.localData.products[idx] = {
      ...this.localData.products[idx],
      ...updates,
      updatedAt: now,
    };
    this.persistLocalStore();
    return this.localData.products[idx];
  }

  public async deleteProduct(id: string): Promise<boolean> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      const res = await this.db.collection('products').deleteOne(filter);
      return res.deletedCount > 0;
    }

    const initLen = this.localData.products.length;
    this.localData.products = this.localData.products.filter(p => p._id !== id);
    this.persistLocalStore();
    return this.localData.products.length < initLen;
  }

  // --- ADVERTISEMENTS ---
  public async getAdvertisements(onlyActive = false): Promise<Advertisement[]> {
    if (this.isMongoConnected && this.db) {
      const query = onlyActive ? { active: true } : {};
      const docs = await this.db.collection('advertisements').find(query).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() } as unknown as Advertisement));
    }
    return onlyActive
      ? this.localData.advertisements.filter(a => a.active)
      : this.localData.advertisements;
  }

  public async addAdvertisement(ad: Omit<Advertisement, '_id' | 'createdAt'>): Promise<Advertisement> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('advertisements').insertOne({
        ...ad,
        createdAt: now,
      });
      return { ...ad, _id: res.insertedId.toString(), createdAt: now };
    }

    const newAd: Advertisement = {
      ...ad,
      _id: `ad_${Date.now()}`,
      createdAt: now,
    };
    this.localData.advertisements.unshift(newAd);
    this.persistLocalStore();
    return newAd;
  }

  public async updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<Advertisement | null> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      await this.db.collection('advertisements').updateOne(filter, { $set: updates });
      const doc = await this.db.collection('advertisements').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Advertisement) : null;
    }

    const idx = this.localData.advertisements.findIndex(a => a._id === id);
    if (idx === -1) return null;
    this.localData.advertisements[idx] = { ...this.localData.advertisements[idx], ...updates };
    this.persistLocalStore();
    return this.localData.advertisements[idx];
  }

  public async deleteAdvertisement(id: string): Promise<boolean> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
      const res = await this.db.collection('advertisements').deleteOne(filter);
      return res.deletedCount > 0;
    }

    const initLen = this.localData.advertisements.length;
    this.localData.advertisements = this.localData.advertisements.filter(a => a._id !== id);
    this.persistLocalStore();
    return this.localData.advertisements.length < initLen;
  }

  // --- ORDERS ---
  public async getOrders(userId?: string): Promise<Order[]> {
    if (this.isMongoConnected && this.db) {
      const query = userId ? { 'customer.userId': userId } : {};
      const docs = await this.db.collection('orders').find(query).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() } as unknown as Order));
    }

    if (userId) {
      return this.localData.orders.filter(o => o.customer.userId === userId).reverse();
    }
    return [...this.localData.orders].reverse();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { $or: [{ _id: id as any }, { orderNumber: id }] };
      const doc = await this.db.collection('orders').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Order) : null;
    }
    return this.localData.orders.find(o => o._id === id || (o as any).id === id || o.orderNumber === id) || null;
  }

  public async addOrder(orderData: Omit<Order, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = new Date().toISOString();
    const orderNumber = `SRM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      ...orderData,
      _id: `ord_${Date.now()}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('orders').insertOne(newOrder as any);
      newOrder._id = res.insertedId.toString();
    } else {
      this.localData.orders.push(newOrder);
      this.persistLocalStore();
    }

    return newOrder;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const now = new Date().toISOString();
    if (this.isMongoConnected && this.db) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { $or: [{ _id: id as any }, { orderNumber: id }] };
      await this.db.collection('orders').updateOne(filter, {
        $set: { status, updatedAt: now }
      });
      const doc = await this.db.collection('orders').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as unknown as Order) : null;
    }

    const idx = this.localData.orders.findIndex(o => o._id === id || (o as any).id === id || o.orderNumber === id);
    if (idx === -1) return null;
    this.localData.orders[idx].status = status;
    this.localData.orders[idx].updatedAt = now;
    this.persistLocalStore();
    return this.localData.orders[idx];
  }

  // --- USERS & AUTH ---
  public async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isMongoConnected && this.db) {
      const doc = await this.db.collection('users').findOne({ email: cleanEmail });
      return doc ? ({ ...doc, _id: doc._id.toString() } as any) : null;
    }

    return this.localData.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async getUserById(id: string): Promise<(User & { passwordHash: string }) | null> {
    if (this.isMongoConnected && this.db) {
      let filter: any = { _id: id };
      try {
        if (ObjectId.isValid(id)) filter = { _id: new ObjectId(id) };
      } catch {}
      const doc = await this.db.collection('users').findOne(filter);
      return doc ? ({ ...doc, _id: doc._id.toString() } as any) : null;
    }

    return this.localData.users.find(u => u._id === id || (u as any).id === id) || null;
  }

  public async getUserByPhoneOrEmail(identifier: string): Promise<(User & { passwordHash: string }) | null> {
    const clean = identifier.toLowerCase().trim();
    if (this.isMongoConnected && this.db) {
      const doc = await this.db.collection('users').findOne({
        $or: [{ email: clean }, { phone: clean }]
      });
      return doc ? ({ ...doc, _id: doc._id.toString() } as any) : null;
    }

    return this.localData.users.find(
      u => u.email.toLowerCase() === clean || u.phone === clean
    ) || null;
  }

  public async addUser(userData: Omit<User, '_id'> & { passwordHash: string }): Promise<User> {
    const newUser: User & { passwordHash: string } = {
      ...userData,
      _id: `usr_${Date.now()}`,
    };

    if (this.isMongoConnected && this.db) {
      const res = await this.db.collection('users').insertOne(newUser as any);
      newUser._id = res.insertedId.toString();
    } else {
      this.localData.users.push(newUser);
      this.persistLocalStore();
    }

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  public async getCustomers(): Promise<User[]> {
    if (this.isMongoConnected && this.db) {
      const docs = await this.db.collection('users').find({ role: 'CUSTOMER' }).toArray();
      return docs.map(d => {
        const { passwordHash, ...safe } = d;
        return { ...safe, _id: d._id.toString() } as unknown as User;
      });
    }

    return this.localData.users
      .filter(u => u.role === 'CUSTOMER')
      .map(({ passwordHash, ...safe }) => safe);
  }

  // --- DASHBOARD STATS ---
  public async getStats(): Promise<DashboardStats> {
    const products = await this.getProducts();
    const categories = await this.getCategories();
    const orders = await this.getOrders();
    const customers = await this.getCustomers();

    const pendingOrders = orders.filter(
      o => o.status === 'Pending' || o.status === 'Processing'
    ).length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue,
      totalCustomers: customers.length,
      recentOrders: orders.slice(0, 5),
    };
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<any> {
    if (!this.localData.settings) {
      this.localData.settings = {
        ...DEFAULT_STORE_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
      this.persistLocalStore();
    }
    return this.localData.settings;
  }

  public async updateSettings(updates: any): Promise<any> {
    const current = await this.getSettings();
    this.localData.settings = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.persistLocalStore();
    return this.localData.settings;
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(): Promise<any[]> {
    if (!this.localData.notifications) {
      this.localData.notifications = [];
    }
    return this.localData.notifications;
  }

  public async addNotification(notif: any): Promise<any> {
    if (!this.localData.notifications) {
      this.localData.notifications = [];
    }
    const newNotif = {
      ...notif,
      _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.localData.notifications.unshift(newNotif);
    this.persistLocalStore();
    return newNotif;
  }

  public async markNotificationAsRead(id: string): Promise<any> {
    if (!this.localData.notifications) return null;
    const notif = this.localData.notifications.find((n: any) => n._id === id || n.id === id);
    if (notif) {
      notif.read = true;
      this.persistLocalStore();
    }
    return notif;
  }

  public async markAllNotificationsAsRead(role?: string, userId?: string): Promise<void> {
    if (!this.localData.notifications) return;
    this.localData.notifications.forEach((n: any) => {
      if (role === 'ADMIN' && n.target === 'ADMIN') {
        n.read = true;
      } else if (role === 'CUSTOMER' && n.target === 'CUSTOMER' && (n.userId === userId || !n.userId)) {
        n.read = true;
      }
    });
    this.persistLocalStore();
  }
}

export const dbManager = new DatabaseManager();
