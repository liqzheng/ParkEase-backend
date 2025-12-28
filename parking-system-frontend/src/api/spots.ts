import api from './axios';
import type { ParkingSpace } from '../types';

// 获取所有停车位
export const getAllSpaces = async (): Promise<ParkingSpace[]> => {
  const response = await api.get<ParkingSpace[]>('/parking-spaces');
  return response.data;
};

// 获取可用停车位
export const getAvailableSpaces = async (): Promise<ParkingSpace[]> => {
  const response = await api.get<ParkingSpace[]>('/parking-spaces/available');
  return response.data;
};

// 根据ID获取停车位
export const getSpaceById = async (id: string): Promise<ParkingSpace> => {
  const response = await api.get<ParkingSpace>(`/parking-spaces/${id}`);
  return response.data;
};

// 按楼层获取停车位
export const getSpacesByFloor = async (floor: number): Promise<ParkingSpace[]> => {
  const response = await api.get<ParkingSpace[]>(`/parking-spaces/floor/${floor}`);
  return response.data;
};

// 按区域获取停车位
export const getSpacesByZone = async (zone: string): Promise<ParkingSpace[]> => {
  const response = await api.get<ParkingSpace[]>(`/parking-spaces/zone/${zone}`);
  return response.data;
};

// 创建停车位（需要管理员权限）
export const createSpace = async (data: Partial<ParkingSpace>): Promise<ParkingSpace> => {
  const response = await api.post<ParkingSpace>('/parking-spaces', data);
  return response.data;
};

// 更新停车位（需要管理员权限）
export const updateSpace = async (id: string, data: Partial<ParkingSpace>): Promise<any> => {
  const response = await api.put(`/parking-spaces/${id}`, data);
  return response.data;
};

// 更新停车位状态
export const updateSpaceStatus = async (id: string, status: ParkingSpace['status']): Promise<any> => {
  const response = await api.put(`/parking-spaces/${id}/status`, { status });
  return response.data;
};

// 删除停车位（需要管理员权限）
export const deleteSpace = async (id: string): Promise<void> => {
  await api.delete(`/parking-spaces/${id}`);
};

