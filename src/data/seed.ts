import type { Room, Bed, Booking } from '../types';
import { roomStorage, bedStorage, bookingStorage } from '../utils/storage';
import { getTodayString, formatDate } from '../utils/date';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 根据房间自动生成床位（上下铺交替）
 */
function generateBedsForRoom(roomId: string, capacity: number): Bed[] {
  const beds: Bed[] = [];
  for (let i = 1; i <= capacity; i++) {
    beds.push({
      id: generateId(),
      roomId,
      bedNumber: i,
      // 奇数下铺，偶数上铺
      bedType: i % 2 === 1 ? 'lower' : 'upper',
    });
  }
  return beds;
}

/**
 * 初始化默认房间数据
 */
export function getInitialRooms(): Room[] {
  return [
    {
      id: 'room-f-4',
      name: '樱花女生四人间',
      capacity: 4,
      pricePerNight: 68,
      genderRestriction: 'female-only',
      description: '温馨女生专属房，独立卫浴，带储物柜',
    },
    {
      id: 'room-m-4',
      name: '橡树男生四人间',
      capacity: 4,
      pricePerNight: 68,
      genderRestriction: 'male-only',
      description: '舒适男生房，空调齐全，安静整洁',
    },
    {
      id: 'room-mix-6',
      name: '星空混住六人间',
      capacity: 6,
      pricePerNight: 58,
      genderRestriction: 'mixed',
      description: '风景好楼层，混住房型，性价比高',
    },
  ];
}

/**
 * 初始化默认床位数据
 */
export function getInitialBeds(rooms: Room[]): Bed[] {
  let allBeds: Bed[] = [];
  rooms.forEach(room => {
    allBeds = allBeds.concat(generateBedsForRoom(room.id, room.capacity));
  });
  return allBeds;
}

/**
 * 创建示例预订数据（用于演示拼房功能）
 */
function getSampleBookings(rooms: Room[], beds: Bed[]): Booking[] {
  const today = getTodayString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dayAfter = formatDate(tomorrow);

  const bookings: Booking[] = [];

  // 女生四人间：已有1位女生预订
  const femaleRoom = rooms.find(r => r.genderRestriction === 'female-only');
  if (femaleRoom) {
    const fBed = beds.find(b => b.roomId === femaleRoom.id && b.bedNumber === 1);
    if (fBed) {
      bookings.push({
        id: generateId(),
        roomId: femaleRoom.id,
        bedId: fBed.id,
        guestName: '小雨',
        guestGender: 'female',
        phone: '138****1234',
        checkInDate: today,
        checkOutDate: dayAfter,
        totalPrice: femaleRoom.pricePerNight * 2,
        status: 'confirmed',
        notes: '安静床位即可',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 混住六人间：已有2位客人（1男1女）
  const mixRoom = rooms.find(r => r.genderRestriction === 'mixed');
  if (mixRoom) {
    const mixBeds = beds.filter(b => b.roomId === mixRoom.id);
    // 下铺2号床 - 男
    const bed1 = mixBeds.find(b => b.bedNumber === 2);
    if (bed1) {
      bookings.push({
        id: generateId(),
        roomId: mixRoom.id,
        bedId: bed1.id,
        guestName: '阿杰',
        guestGender: 'male',
        phone: '139****5678',
        checkInDate: today,
        checkOutDate: dayAfter,
        totalPrice: mixRoom.pricePerNight * 2,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
    }
    // 下铺3号床 - 女
    const bed2 = mixBeds.find(b => b.bedNumber === 3);
    if (bed2) {
      bookings.push({
        id: generateId(),
        roomId: mixRoom.id,
        bedId: bed2.id,
        guestName: '小林',
        guestGender: 'female',
        phone: '137****9012',
        checkInDate: today,
        checkOutDate: dayAfter,
        totalPrice: mixRoom.pricePerNight * 2,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return bookings;
}

/**
 * 检查并初始化数据（如果 localStorage 为空则填充初始数据）
 */
export function initializeDataIfNeeded(): { rooms: Room[]; beds: Bed[]; bookings: Booking[] } {
  let rooms = roomStorage.getAll();
  let beds = bedStorage.getAll();
  let bookings = bookingStorage.getAll();

  // 如果没有房间数据，初始化默认数据
  if (rooms.length === 0) {
    rooms = getInitialRooms();
    roomStorage.save(rooms);
  }

  if (beds.length === 0) {
    beds = getInitialBeds(rooms);
    bedStorage.save(beds);
  }

  if (bookings.length === 0) {
    bookings = getSampleBookings(rooms, beds);
    bookingStorage.save(bookings);
  }

  return { rooms, beds, bookings };
}
