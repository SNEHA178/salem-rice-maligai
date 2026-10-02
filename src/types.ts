export type PricingMode = 'RETAIL' | 'WHOLESALE' | 'retail' | 'wholesale';

export type ProductUnit =
  | 'kg'
  | 'g'
  | 'litre'
  | 'ml'
  | 'piece'
  | 'packet'
  | 'bag'
  | '25kg bag'
  | '50kg bag'
  | string;

export interface LocalizedField {
  en: string;
  ta: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  tamilName?: string;
  nameTamil?: string;
  description: string;
  category: any;
  categoryName?: string;
  image: string;
  images?: string[];
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinimumQuantity?: number | null;
  unit: ProductUnit;
  stock: number;
  available: boolean;
  featured: boolean;
  popular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  tamilName?: string;
  description?: string;
  image: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Advertisement {
  _id: string;
  id?: string;
  title: string;
  tamilTitle?: string;
  subtitle?: string;
  image: string;
  linkCategory?: string;
  badge?: string;
  active: boolean;
  createdAt?: string;
}

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  address?: string;
  city?: string;
  pincode?: string;
  businessName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  unit: ProductUnit | string;
  pricingMode: PricingMode;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  customer: {
    userId?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  deliveryAddress?: {
    fullName?: string;
    phone?: string;
    addressLine?: string;
    area?: string;
    pincode?: string;
    street?: string;
    city?: string;
    state?: string;
    landmark?: string;
  };
  items: OrderItem[];
  pricingMode: PricingMode | 'MIXED' | 'mixed';
  subtotal: number;
  deliveryFee: number;
  deliveryCharge?: number;
  total: number;
  paymentMethod: 'COD' | 'Cash on Delivery' | string;
  paymentStatus?: 'PENDING' | 'PAID' | string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id?: string;
  productId: string;
  product: Product;
  productName?: string;
  name?: string;
  nameTamil?: string;
  image?: string;
  unit?: string;
  pricingMode: PricingMode;
  unitPrice?: number;
  quantity: number;
  subtotal?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export interface DbStatus {
  connected: boolean;
  type: 'mongodb_atlas' | 'local_durable_store';
  databaseName?: string;
  message: string;
}
