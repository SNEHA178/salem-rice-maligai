import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  address?: string;
  city?: string;
  pincode?: string;
  businessName?: string;
  addresses?: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, default: 'Salem', trim: true },
    state: { type: String, default: 'Tamil Nadu', trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, default: '', trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER', required: true },
    address: { type: String, default: 'Shevapet, Salem - 636002' },
    city: { type: String, default: 'Salem' },
    pincode: { type: String, default: '636002' },
    businessName: { type: String, default: '' },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
