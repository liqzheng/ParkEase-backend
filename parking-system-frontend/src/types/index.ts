// 用户类型
export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'ADMIN' | 'GUARD';
  plateNumbers: string[];
  createdAt: string;
}

// 停车位类型
export interface ParkingSpace {
  _id: string;
  spaceNumber: string;
  floor: number;
  zone: 'A' | 'B' | 'C' | 'D';
  type: 'REGULAR' | 'VIP' | 'DISABLED';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  createdAt: string;
  updatedAt: string;
}

// 车辆类型
export interface Vehicle {
  _id: string;
  plateNumber: string;
  owner: User | string;
  make: string;
  model: string;
  color: string;
  type: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
  createdAt: string;
  updatedAt: string;
}

// 停车记录类型
export interface ParkingRecord {
  _id: string;
  vehicle: Vehicle | string;
  space: ParkingSpace | string;
  checkInTime: string;
  checkOutTime?: string;
  fee: number;
  status: 'ACTIVE' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

// 预订类型
export interface Reservation {
  _id: string;
  user: User | string;
  space: ParkingSpace | string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'OWNER' | 'ADMIN' | 'GUARD';
}

