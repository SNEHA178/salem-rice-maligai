import { api } from './api';
import { Advertisement } from '../types';

export const getAdvertisements = async (includeAll: boolean = false): Promise<Advertisement[]> =>
  api.getAdvertisements(includeAll);

export const getAdvertisementById = async (id: string): Promise<Advertisement> =>
  api.getAdvertisementById(id);

export const createAdvertisement = async (data: any): Promise<Advertisement> =>
  api.createAdvertisement(data);

export const updateAdvertisement = async (id: string, data: any): Promise<Advertisement> =>
  api.updateAdvertisement(id, data);

export const deleteAdvertisement = async (id: string): Promise<{ success: boolean }> =>
  api.deleteAdvertisement(id);

export const advertisementService = {
  getAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
};

export default advertisementService;
