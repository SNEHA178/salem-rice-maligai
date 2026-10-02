import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: {
    en: string;
    ta: string;
  };
  description: {
    en: string;
    ta: string;
  };
  image: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, default: '' },
      ta: { type: String, default: '' },
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

categorySchema.index({ 'name.en': 1 });
categorySchema.index({ 'name.ta': 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
export default Category;
