import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  title: {
    en: string;
    ta: string;
  };
  subtitle?: {
    en: string;
    ta: string;
  };
  image: string;
  ctaText?: {
    en: string;
    ta: string;
  };
  ctaLink?: string;
  linkCategory?: string;
  badge?: string;
  active: boolean;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new Schema<IAdvertisement>(
  {
    title: {
      en: { type: String, required: true },
      ta: { type: String, required: true },
    },
    subtitle: {
      en: { type: String, default: '' },
      ta: { type: String, default: '' },
    },
    image: { type: String, required: true },
    ctaText: {
      en: { type: String, default: 'Shop Now' },
      ta: { type: String, default: 'இப்போதே வாங்குங்கள்' },
    },
    ctaLink: { type: String, default: '/products' },
    linkCategory: { type: String, default: 'Salem Rice' },
    badge: { type: String, default: 'Special Offer' },
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

advertisementSchema.index({ active: 1, displayOrder: 1, createdAt: -1 });

export const Advertisement = mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', advertisementSchema);
export default Advertisement;
