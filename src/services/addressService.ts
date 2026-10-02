import { api } from './api';

export const getAddresses = async (): Promise<any[]> => api.getAddresses();

export const createAddress = async (data: any): Promise<any> => api.createAddress(data);

export const updateAddress = async (id: string, data: any): Promise<any> => api.updateAddress(id, data);

export const deleteAddress = async (id: string): Promise<{ success: boolean }> => api.deleteAddress(id);

export const addressService = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};

export default addressService;
