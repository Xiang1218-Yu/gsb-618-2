import type { StorageData } from '@/types';

const STORAGE_KEY = 'hostel_booking_data';

/**
 * 从 localStorage 读取数据
 */
export function loadFromStorage(): StorageData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StorageData;
    }
  } catch (e) {
    console.error('读取本地存储失败:', e);
  }
  return null;
}

/**
 * 保存数据到 localStorage
 */
export function saveToStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存到本地存储失败:', e);
  }
}

/**
 * 清除本地存储数据（用于重置）
 */
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 格式化日期显示
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
