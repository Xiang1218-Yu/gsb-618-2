import type { Room, Bed, Booking } from '../types';
import { generateId, getTodayString } from './storage';

// 生成房间初始数据
export function generateInitialRooms(): Room[] {
  return [
    {
      id: 'room_male_4',
      name: '阳光男生四人间',
      type: 'dorm_male',
      capacity: 4,
      pricePerBed: 68,
      description: '朝南窗户，独立储物柜，每个床位有阅读灯和充电插座',
      isActive: true,
    },
    {
      id: 'room_female_4',
      name: '温馨女生四人间',
      type: 'dorm_female',
      capacity: 4,
      pricePerBed: 78,
      description: '粉色系装饰，带梳妆台，独立卫浴，提供吹风机',
      isActive: true,
    },
    {
      id: 'room_mixed_6',
      name: '观景混住六人间',
      type: 'dorm_mixed',
      capacity: 6,
      pricePerBed: 58,
      description: '落地窗观城市夜景，大公共空间，性价比之选',
      isActive: true,
    },
    {
      id: 'room_mixed_8',
      name: '背包客混住八人间',
      type: 'dorm_mixed',
      capacity: 8,
      pricePerBed: 48,
      description: '经济实惠，适合预算有限的旅行者，公共卫浴',
      isActive: true,
    },
    {
      id: 'room_private_2',
      name: '情侣包间',
      type: 'private',
      capacity: 2,
      pricePerBed: 188,
      description: '独立双人间，大床，私享空间，适合情侣或好友',
      isActive: true,
    },
  ];
}

// 根据房间生成床位数据
export function generateBedsForRooms(rooms: Room[]): Bed[] {
  const beds: Bed[] = [];
  
  rooms.forEach(room => {
    const bedCount = room.capacity;
    
    for (let i = 0; i < bedCount; i++) {
      const position = i % 2 === 0 ? 'lower' : 'upper';
      const bedNumber = `${Math.floor(i / 2) + 1}号${position === 'upper' ? '上铺' : '下铺'}`;
      
      beds.push({
        id: `bed_${room.id}_${i + 1}`,
        roomId: room.id,
        bedNumber,
        position,
        status: 'available',
      });
    }
  });
  
  return beds;
}

// 生成示例预订数据
export function generateInitialBookings(beds: Bed[]): Booking[] {
  const today = getTodayString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];
  
  // 找到一些可用床位来创建示例预订
  const bookings: Booking[] = [];
  
  // 在女生四人间预订一个床位
  const femaleRoomBeds = beds.filter(b => b.roomId === 'room_female_4');
  if (femaleRoomBeds.length > 0) {
    const bed = femaleRoomBeds[0];
    bookings.push({
      id: generateId(),
      bedId: bed.id,
      roomId: 'room_female_4',
      guestName: '小雨',
      gender: 'female',
      phone: '138****1234',
      checkIn: today,
      checkOut: dayAfterStr,
      genderPreference: 'female_only',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    });
  }
  
  // 在混住六人间预订两个床位（示例拼房）
  const mixedRoomBeds = beds.filter(b => b.roomId === 'room_mixed_6');
  if (mixedRoomBeds.length >= 2) {
    const bed1 = mixedRoomBeds[0];
    bookings.push({
      id: generateId(),
      bedId: bed1.id,
      roomId: 'room_mixed_6',
      guestName: '阿杰',
      gender: 'male',
      phone: '139****5678',
      checkIn: today,
      checkOut: tomorrowStr,
      genderPreference: 'any',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    });
    
    const bed2 = mixedRoomBeds[2];
    bookings.push({
      id: generateId(),
      bedId: bed2.id,
      roomId: 'room_mixed_6',
      guestName: '小明',
      gender: 'male',
      phone: '137****9012',
      checkIn: today,
      checkOut: tomorrowStr,
      genderPreference: 'any',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    });
  }
  
  // 在男生四人间预订一个床位
  const maleRoomBeds = beds.filter(b => b.roomId === 'room_male_4');
  if (maleRoomBeds.length > 0) {
    const bed = maleRoomBeds[1];
    bookings.push({
      id: generateId(),
      bedId: bed.id,
      roomId: 'room_male_4',
      guestName: '大伟',
      gender: 'male',
      phone: '136****3456',
      checkIn: today,
      checkOut: dayAfterStr,
      genderPreference: 'male_only',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    });
  }
  
  return bookings;
}

// 初始化所有数据
export function initializeData(): { rooms: Room[]; beds: Bed[]; bookings: Booking[] } {
  const rooms = generateInitialRooms();
  const beds = generateBedsForRooms(rooms);
  let bookings = generateInitialBookings(beds);
  
  // 根据预订数据更新床位状态
  bookings.forEach(booking => {
    const bedIndex = beds.findIndex(b => b.id === booking.bedId);
    if (bedIndex !== -1 && booking.status === 'confirmed') {
      beds[bedIndex] = { ...beds[bedIndex], status: 'booked' };
    }
  });
  
  return { rooms, beds, bookings };
}
