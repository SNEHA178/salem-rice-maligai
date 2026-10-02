import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: {
    en: string;
    ta: string;
  } | string;
  image?: string;
  unit?: {
    en: string;
    ta: string;
  } | string;
  pricingMode: 'retail' | 'wholesale' | 'RETAIL' | 'WHOLESALE';
  unitPrice: number;
  price?: number;
  quantity: number;
  subtotal: number;
}

export interface IDeliveryAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    userId?: string;
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: IDeliveryAddress;
  customerPhone?: string;
  items: IOrderItem[];
  pricingMode: 'retail' | 'wholesale' | 'mixed' | 'RETAIL' | 'WHOLESALE' | 'MIXED';
  subtotal: number;
  deliveryCharge: number;
  deliveryFee?: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  rejectionReason?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  paymentMethod: string;
  paymentStatus: string;
  stockRestored?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      userId: { type: String, index: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: 'Salem' },
      state: { type: String, default: 'Tamil Nadu' },
      pincode: { type: String, default: '636002' },
      landmark: { type: String, default: '' },
    },
    customerPhone: { type: String },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: Schema.Types.Mixed, required: true },
        image: { type: String, default: '' },
        unit: { type: Schema.Types.Mixed, default: 'kg' },
        pricingMode: { type: String, default: 'retail' },
        unitPrice: { type: Number, required: true },
        price: { type: Number },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],
    pricingMode: {
      type: String,
      default: 'retail',
    },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    estimatedDeliveryDate: { type: String, default: '' },
    notes: { type: String, default: '' },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, default: 'PENDING' },
    stockRestored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful Compound Indexes for query performance
orderSchema.index({ 'customer.userId': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
