import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  phone: string;
  altPhone: string;
  address: string;
  // Operating hours
  monSatOpen: string;
  monSatClose: string;
  sunOpen: string;
  sunClose: string;
  // Delivery settings
  salemOnly: boolean;
  allowedPincodes: string[];
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  tomorrowDeliveryRule: boolean;
  // Shop Availability
  shopStatus: 'OPEN' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE';
  noticeEn: string;
  noticeTa: string;
  reopenDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: 'Salem Rice & Maligai' },
    phone: { type: String, default: '8973203053' },
    altPhone: { type: String, default: '8946071718' },
    address: { type: String, default: 'Shevapet, Salem - 636002' },
    monSatOpen: { type: String, default: '07:00' },
    monSatClose: { type: String, default: '21:30' },
    sunOpen: { type: String, default: '07:00' },
    sunClose: { type: String, default: '14:00' },
    salemOnly: { type: Boolean, default: true },
    allowedPincodes: {
      type: [String],
      default: [
        '636001', '636002', '636003', '636004', '636005',
        '636006', '636007', '636008', '636009', '636010',
        '636011', '636012', '636015', '636016', '636017',
        '636020', '636030', '636038', '636140'
      ],
    },
    deliveryCharge: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    tomorrowDeliveryRule: { type: Boolean, default: true },
    shopStatus: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'TEMPORARILY_UNAVAILABLE'],
      default: 'OPEN',
    },
    noticeEn: { type: String, default: '' },
    noticeTa: { type: String, default: '' },
    reopenDate: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
