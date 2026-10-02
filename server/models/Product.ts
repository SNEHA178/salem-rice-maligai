import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: {
    en: string;
    ta: string;
  };
  description: {
    en: string;
    ta: string;
  };
  category: mongoose.Types.ObjectId | string;
  categoryName?: string;
  image: string;
  retailPrice: number;
  wholesalePrice: number;
  unit: {
    en: string;
    ta: string;
  };
  stock: number;
  available: boolean;
  featured: boolean;
  wholesaleMinimumQuantity?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, default: '' },
      ta: { type: String, default: '' },
    },
    category: {
      type: Schema.Types.Mixed, // Supports both ObjectId and Category Name string
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    retailPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    wholesalePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      en: { type: String, required: true, default: 'kg' },
      ta: { type: String, required: true, default: 'கிலோ' },
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    wholesaleMinimumQuantity: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

// Database Indexes for high performance querying per requirement 27
productSchema.index({ category: 1, available: 1 });
productSchema.index({ featured: 1, available: 1 });
productSchema.index({ 'name.en': 'text', 'name.ta': 'text' });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;
