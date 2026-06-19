import type { Room, Bed, Booking } from '../types';

// localStorage 存储键名常量
const STORAGE_KEYS = {
  ROOMS: 'hostel_rooms',
  BEDS: 'hostel_beds',
  BOOKINGS: 'hostel_bookings',
} as const;

/**
 * 通用：从 localStorage 获取数据
 */
function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 通用：保存数据到 localStorage
 */
function setStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// 房间相关操作
export const roomStorage = {
  getAll: (): Room[] => getStorageData<Room[]>(STORAGE_KEYS.ROOMS, []),
  save: (rooms: Room[]) => setStorageData(STORAGE_KEYS.ROOMS, rooms),
};

// 床位相关操作
export const bedStorage = {
  getAll: (): Bed[] => getStorageData<Bed[]>(STORAGE_KEYS.BEDS, []),
  save: (beds: Bed[]) => setStorageData(STORAGE_KEYS.BEDS, beds),
};

// 预订订单相关操作
export const bookingStorage = {
  getAll: (): Booking[] => getStorageData<Booking[]>(STORAGE_KEYS.BOOKINGS, []),
  save: (bookings: Booking[]) => setStorageData(STORAGE_KEYS.BOOKINGS, bookings),
};
