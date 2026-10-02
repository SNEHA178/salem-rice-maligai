import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  target: 'ADMIN' | 'CUSTOMER';
  userId?: string;
  orderId?: string;
  orderNumber?: string;
  type: 'NEW_ORDER' | 'ORDER_STATUS_CHANGED' | 'SYSTEM';
  title: string | { en: string; ta: string };
  message: string | { en: string; ta: string };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    target: { type: String, enum: ['ADMIN', 'CUSTOMER'], required: true, index: true },
    userId: { type: String, index: true },
    orderId: { type: String, index: true },
    orderNumber: { type: String },
    type: { type: String, enum: ['NEW_ORDER', 'ORDER_STATUS_CHANGED', 'SYSTEM'], required: true },
    title: { type: Schema.Types.Mixed, required: true },
    message: { type: Schema.Types.Mixed, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ target: 1, read: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
