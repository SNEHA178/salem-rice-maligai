import { api } from './api';
import { Order } from '../types';

export const getOrders = async (params?: { status?: string; search?: string; userId?: string } | string): Promise<Order[]> => {
  if (typeof params === 'string') {
    return api.getOrders({ userId: params });
  }
  return api.getOrders(params);
};

export const getOrderById = async (id: string): Promise<Order> => api.getOrderById(id);

export const createOrder = async (orderData: any): Promise<Order> => api.createOrder(orderData);

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => api.updateOrderStatus(id, status);

export const orderService = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};

export default orderService;
