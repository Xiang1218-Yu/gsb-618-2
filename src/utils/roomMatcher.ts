import type { Room, Bed, Booking, Gender } from '../types';
import { datesOverlap } from './date';

/**
 * 拼房匹配与床位可用性工具
 */

/**
 * 获取指定房间在指定日期范围内已被预订的床位ID集合
 */
export function getBookedBedIds(
  bookings: Booking[],
  roomId: string,
  checkIn: string,
  checkOut: string
): Set<string> {
  const booked = new Set<string>();
  bookings
    .filter(b =>
      b.status !== 'cancelled' &&
      b.roomId === roomId &&
      datesOverlap(checkIn, checkOut, b.checkInDate, b.checkOutDate)
    )
    .forEach(b => booked.add(b.bedId));
  return booked;
}

/**
 * 获取指定房间指定日期范围内同房间的已预订订单（拼房信息）
 */
export function getRoommates(
  bookings: Booking[],
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): Booking[] {
  return bookings.filter(b =>
    b.status !== 'cancelled' &&
    b.id !== excludeBookingId &&
    b.roomId === roomId &&
    datesOverlap(checkIn, checkOut, b.checkInDate, b.checkOutDate)
  );
}

/**
 * 统计房间内已住客人性别构成
 */
export function getGenderStats(bookings: Booking[]): { female: number; male: number } {
  const stats = { female: 0, male: 0 };
  bookings.forEach(b => {
    if (b.guestGender === 'female') stats.female++;
    else stats.male++;
  });
  return stats;
}

/**
 * 性别限制文本映射
 */
export function genderRestrictionText(type: string): string {
  const map: Record<string, string> = {
    'female-only': '女生房',
    'male-only': '男生房',
    'mixed': '混住房',
  };
  return map[type] || type;
}

/**
 * 性别中文映射
 */
export function genderText(gender: Gender): string {
  return gender === 'female' ? '女' : '男';
}

/**
 * 检查房间是否符合性别偏好筛选
 */
export function roomMatchesFilter(room: Room, filter: string): boolean {
  if (filter === 'all') return true;
  return room.genderRestriction === filter;
}

/**
 * 检查预订者性别是否符合房间性别限制
 */
export function genderAllowed(room: Room, guestGender: Gender): boolean {
  if (room.genderRestriction === 'mixed') return true;
  if (room.genderRestriction === 'female-only') return guestGender === 'female';
  if (room.genderRestriction === 'male-only') return guestGender === 'male';
  return true;
}

/**
 * 计算房间在指定日期的可用床位数
 */
export function getAvailableBedCount(
  room: Room,
  beds: Bed[],
  bookings: Booking[],
  checkIn: string,
  checkOut: string
): number {
  const roomBeds = beds.filter(b => b.roomId === room.id);
  const bookedIds = getBookedBedIds(bookings, room.id, checkIn, checkOut);
  return roomBeds.length - bookedIds.size;
}
