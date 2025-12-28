import api from './axios';
import type { ParkingRecord } from '../types';

// 车辆入场（需要管理员/保安权限）
export const checkIn = async (vehicleId: string, spaceId: string): Promise<ParkingRecord> => {
  const response = await api.post<ParkingRecord>('/parking-records/check-in', {
    vehicleId,
    spaceId,
  });
  return response.data;
};

// 车辆出场（需要管理员/保安权限）
export const checkOut = async (recordId: string): Promise<ParkingRecord> => {
  const response = await api.post<ParkingRecord>('/parking-records/check-out', {
    recordId,
  });
  return response.data;
};

// 支付停车费
export const payFee = async (recordId: string): Promise<ParkingRecord> => {
  const response = await api.post<ParkingRecord>('/parking-records/pay', {
    recordId,
  });
  return response.data;
};

// 获取所有停车记录（需要管理员/保安权限）
export const getAllRecords = async (): Promise<ParkingRecord[]> => {
  const response = await api.get<ParkingRecord[]>('/parking-records');
  return response.data;
};

// 获取活跃的停车记录（需要管理员/保安权限）
export const getActiveRecords = async (): Promise<ParkingRecord[]> => {
  const response = await api.get<ParkingRecord[]>('/parking-records/active');
  return response.data;
};

// 根据车辆获取记录
export const getRecordsByVehicle = async (vehicleId: string): Promise<ParkingRecord[]> => {
  const response = await api.get<ParkingRecord[]>(`/parking-records/vehicle/${vehicleId}`);
  return response.data;
};

// 根据ID获取记录
export const getRecordById = async (id: string): Promise<ParkingRecord> => {
  const response = await api.get<ParkingRecord>(`/parking-records/${id}`);
  return response.data;
};

