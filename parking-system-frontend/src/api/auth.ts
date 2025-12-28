import api from './axios';
import type { User, LoginRequest, RegisterRequest } from '../types';

// 用户注册
export const register = async (data: RegisterRequest): Promise<User> => {
  const response = await api.post<User>('/users/signup', data);
  return response.data;
};

// 用户登录
export const login = async (data: LoginRequest): Promise<User> => {
  const response = await api.post<User>('/users/signin', data);
  return response.data;
};

// 用户登出
export const logout = async (): Promise<void> => {
  await api.post('/users/signout');
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/profile');
  return response.data;
};

