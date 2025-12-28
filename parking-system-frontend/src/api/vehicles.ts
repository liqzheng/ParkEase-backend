import api from './axios';
import type { Vehicle } from '../types';

// 获取所有车辆（需要管理员/保安权限）
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<Vehicle[]>('/vehicles');
  return response.data;
};

// 根据ID获取车辆
export const getVehicleById = async (id: string): Promise<Vehicle> => {
  const response = await api.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

// 根据车牌号获取车辆
export const getVehicleByPlate = async (plateNumber: string): Promise<Vehicle> => {
  const response = await api.get<Vehicle>(`/vehicles/plate/${plateNumber}`);
  return response.data;
};

// 根据车主获取车辆
export const getVehiclesByOwner = async (ownerId: string): Promise<Vehicle[]> => {
  const response = await api.get<Vehicle[]>(`/vehicles/owner/${ownerId}`);
  return response.data;
};

// 创建车辆
export const createVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.post<Vehicle>('/vehicles', data);
  return response.data;
};

// 更新车辆
export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<any> => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

// 删除车辆
export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};

