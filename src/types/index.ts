// 性别类型
export type Gender = 'male' | 'female';

// 性别政策（房间入住限制）
export type GenderPolicy = 'male_only' | 'female_only' | 'mixed';

// 床位状态
export type BedStatus = 'available' | 'booked' | 'occupied';

// 预订状态
export type BookingStatus = 'pending' | 'checked_in' | 'cancelled';

// 房间类型
export type RoomType = 'dorm_4' | 'dorm_6' | 'dorm_8' | 'private';

// 房间实体
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  genderPolicy: GenderPolicy;
  pricePerNight: number;
}

// 床位实体
export interface Bed {
  id: string;
  roomId: string;
  bedNumber: number;
}

// 预订记录实体
export interface Booking {
  id: string;
  bedId: string;
  roomId: string;
  guestName: string;
  guestGender: Gender;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  createdAt: string;
}

// 存储在localStorage中的完整数据结构
export interface StorageData {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
}
