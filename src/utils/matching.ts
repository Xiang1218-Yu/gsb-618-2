import type { Room, Bed, Booking, GenderPreference, Gender } from '../types';

// 检查房间类型是否符合性别偏好
export function isRoomTypeMatch(roomType: Room['type'], preference: GenderPreference, guestGender: Gender): boolean {
  // 如果是包间，任何人都可以住
  if (roomType === 'private') return true;
  
  switch (preference) {
    case 'male_only':
      return roomType === 'dorm_male' || roomType === 'dorm_mixed';
    case 'female_only':
      return roomType === 'dorm_female' || roomType === 'dorm_mixed';
    case 'any':
      return true;
    default:
      return true;
  }
}

// 获取房间当前已入住的性别分布
export function getRoomGenderDistribution(
  roomId: string,
  beds: Bed[],
  bookings: Booking[],
  checkIn: string,
  checkOut: string
): { males: number; females: number } {
  // 获取该房间所有已预订床位的预订记录
  const roomBeds = beds.filter(b => b.roomId === roomId);
  const bookedBedIds = roomBeds
    .filter(b => b.status === 'booked')
    .map(b => b.id);
  
  const activeBookings = bookings.filter(b => 
    bookedBedIds.includes(b.bedId) &&
    b.status === 'confirmed' &&
    dateOverlap(b.checkIn, b.checkOut, checkIn, checkOut)
  );
  
  const males = activeBookings.filter(b => b.gender === 'male').length;
  const females = activeBookings.filter(b => b.gender === 'female').length;
  
  return { males, females };
}

// 检查两个日期范围是否有重叠
function dateOverlap(checkIn1: string, checkOut1: string, checkIn2: string, checkOut2: string): boolean {
  return checkIn1 < checkOut2 && checkIn2 < checkOut1;
}

// 推荐床位：智能拼房匹配算法
export function recommendBeds(
  rooms: Room[],
  beds: Bed[],
  bookings: Booking[],
  gender: Gender,
  preference: GenderPreference,
  checkIn: string,
  checkOut: string,
  count: number = 1
): string[] {
  const recommendedBedIds: string[] = [];
  
  // 1. 筛选符合条件的房间
  const eligibleRooms = rooms.filter(room => {
    if (!room.isActive) return false;
    return isRoomTypeMatch(room.type, preference, gender);
  });
  
  // 2. 对每个房间计算评分
  const scoredBeds: { bed: Bed; score: number }[] = [];
  
  for (const room of eligibleRooms) {
    const roomBeds = beds.filter(b => b.roomId === room.id && b.status === 'available');
    const distribution = getRoomGenderDistribution(room.id, beds, bookings, checkIn, checkOut);
    
    for (const bed of roomBeds) {
      let score = 0;
      
      // 基础分：房间类型匹配度
      if ((preference === 'male_only' && room.type === 'dorm_male') ||
          (preference === 'female_only' && room.type === 'dorm_female')) {
        score += 100; // 性别专用房间最高优先级
      } else if (room.type === 'dorm_mixed') {
        score += 50; // 混住房间次之
      } else {
        score += 30;
      }
      
      // 同性别聚集：优先推荐已有相同性别入住的房间
      const sameGenderCount = gender === 'male' ? distribution.males : distribution.females;
      score += sameGenderCount * 20;
      
      // 避免成为第一个异性：如果房间里只有异性，减分
      const otherGenderCount = gender === 'male' ? distribution.females : distribution.males;
      if (otherGenderCount > 0 && sameGenderCount === 0) {
        score -= 40;
      }
      
      // 房间利用率：优先填充已有入住的房间
      const totalOccupied = distribution.males + distribution.females;
      if (totalOccupied > 0) {
        score += totalOccupied * 10;
      }
      
      // 下铺优先（方便进出）
      if (bed.position === 'lower') {
        score += 5;
      }
      
      scoredBeds.push({ bed, score });
    }
  }
  
  // 3. 按评分排序
  scoredBeds.sort((a, b) => b.score - a.score);
  
  // 4. 选择前N个推荐床位
  for (let i = 0; i < Math.min(count, scoredBeds.length); i++) {
    recommendedBedIds.push(scoredBeds[i].bed.id);
  }
  
  return recommendedBedIds;
}

// 判断床位是否被推荐（用于UI高亮）
export function isBedRecommended(
  bedId: string,
  recommendedIds: string[]
): boolean {
  return recommendedIds.includes(bedId);
}

// 计算房间在指定日期范围内的可用床位数
export function getAvailableBedsCount(
  roomId: string,
  beds: Bed[]
): number {
  return beds.filter(b => b.roomId === roomId && b.status === 'available').length;
}
