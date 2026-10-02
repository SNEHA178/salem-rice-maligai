import { api } from './api';
import { Category } from '../types';

export const getCategories = async (includeAll?: boolean): Promise<Category[]> =>
  api.getCategories(includeAll);

export const getCategoryById = async (id: string): Promise<Category> =>
  api.getCategoryById(id);

export const createCategory = async (data: Partial<Category>): Promise<Category> =>
  api.createCategory(data);

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> =>
  api.updateCategory(id, data);

export const deleteCategory = async (id: string): Promise<{ success: boolean }> =>
  api.deleteCategory(id);

export const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
