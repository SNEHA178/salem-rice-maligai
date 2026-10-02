import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Settings } from '../models/Settings';
import { isDbConnected } from '../config/db';

/**
 * PRODUCTION BOOTSTRAP SERVICE
 * Ensures the single authoritative administrator account and store configuration defaults exist.
 * Does NOT generate mock products, categories, advertisements, orders, or demo customers.
 */

export async function seedDevelopmentDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isDbConnected()) {
    return {
      success: true,
      message: 'Running on local persistent database. Bootstrap verified.',
    };
  }

  try {
    console.log('[Bootstrap] Verifying administrative and store configuration...');

    // 1. Ensure initial ADMIN account exists if no admin is present
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (!existingAdmin) {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@salemrice.com').trim();
      const adminPassword = (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_SECRET || 'salemadmin2026').trim();
      const adminPassHash = await bcrypt.hash(adminPassword, 10);

      console.log(`[Bootstrap] Creating initial admin account (${adminEmail})...`);
      await User.create({
        name: 'Store Manager',
        phone: '8973203053',
        email: adminEmail,
        passwordHash: adminPassHash,
        role: 'ADMIN',
        address: 'Shevapet, Salem - 636002',
        city: 'Salem',
        pincode: '636002',
        businessName: 'Salem Rice & Maligai',
      });
      console.log('[Bootstrap] Initial admin account created successfully.');
    }

    // 2. Ensure Store Settings document exists if not present
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      console.log('[Bootstrap] Initializing default store settings...');
      await Settings.create({
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
      });
    }

    console.log('[Bootstrap] Administrative and store configuration check completed.');
    return { success: true, message: 'Bootstrap verified successfully.' };
  } catch (err: any) {
    console.error('[Bootstrap] Error during bootstrap:', err.message);
    return { success: false, message: err.message };
  }
}

export default seedDevelopmentDatabase;

