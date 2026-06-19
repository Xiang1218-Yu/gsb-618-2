import type { Room, Bed, Booking } from '../types';

// LocalStorage 存储键名
const STORAGE_KEYS = {
  ROOMS: 'hostel_rooms',
  BEDS: 'hostel_beds',
  BOOKINGS: 'hostel_bookings',
  INITIALIZED: 'hostel_initialized',
};

// 保存房间数据到本地存储
export function saveRooms(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
}

// 从本地存储获取房间数据
export function loadRooms(): Room[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
  return data ? JSON.parse(data) : null;
}

// 保存床位数据到本地存储
export function saveBeds(beds: Bed[]): void {
  localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
}

// 从本地存储获取床位数据
export function loadBeds(): Bed[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.BEDS);
  return data ? JSON.parse(data) : null;
}

// 保存预订数据到本地存储
export function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

// 从本地存储获取预订数据
export function loadBookings(): Booking[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return data ? JSON.parse(data) : null;
}

// 标记初始数据已加载
export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// 检查是否已初始化
export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

// 清除所有数据（用于重置）
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.ROOMS);
  localStorage.removeItem(STORAGE_KEYS.BEDS);
  localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取今天的日期字符串（YYYY-MM-DD格式）
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 格式化日期显示
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
