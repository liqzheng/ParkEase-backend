import api from './axios';
import type { Reservation } from '../types';

// 创建预订
export const createReservation = async (
  spaceId: string,
  startTime: string,
  endTime: string
): Promise<Reservation> => {
  const response = await api.post<Reservation>('/reservations', {
    spaceId,
    startTime,
    endTime,
  });
  return response.data;
};

// 确认预订（需要管理员权限）
export const confirmReservation = async (reservationId: string): Promise<Reservation> => {
  const response = await api.post<Reservation>('/reservations/confirm', {
    reservationId,
  });
  return response.data;
};

// 取消预订
export const cancelReservation = async (reservationId: string): Promise<Reservation> => {
  const response = await api.post<Reservation>('/reservations/cancel', {
    reservationId,
  });
  return response.data;
};

// 获取所有预订（需要管理员权限）
export const getAllReservations = async (): Promise<Reservation[]> => {
  const response = await api.get<Reservation[]>('/reservations');
  return response.data;
};

// 根据用户获取预订
export const getReservationsByUser = async (userId: string): Promise<Reservation[]> => {
  const response = await api.get<Reservation[]>(`/reservations/user/${userId}`);
  return response.data;
};

// 根据ID获取预订
export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await api.get<Reservation>(`/reservations/${id}`);
  return response.data;
};

