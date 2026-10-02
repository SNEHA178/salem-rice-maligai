import { api } from './api';
import { Product } from '../types';

export const getProducts = async (params?: { category?: string; search?: string; featured?: boolean; available?: boolean }): Promise<Product[]> =>
  api.getProducts(params);

export const getProductById = async (id: string): Promise<Product> =>
  api.getProductById(id);

export const getProductsByCategory = async (category: string): Promise<Product[]> =>
  api.getProducts({ category, available: true });

export const getFeaturedProducts = async (): Promise<Product[]> =>
  api.getProducts({ featured: true });

export const getPopularProducts = async (): Promise<Product[]> =>
  api.getProducts({ featured: true });

export const createProduct = async (data: Partial<Product>): Promise<Product> =>
  api.createProduct(data);

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> =>
  api.updateProduct(id, data);

export const deleteProduct = async (id: string): Promise<{ success: boolean }> =>
  api.deleteProduct(id);

export const productService = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getPopularProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
