import type { Room, Bed, StorageData } from '@/types';
import { generateId } from './storage';

/**
 * 创建房间和对应床位
 */
function createRoomWithBeds(
  name: string,
  type: Room['type'],
  capacity: number,
  genderPolicy: Room['genderPolicy'],
  pricePerNight: number
): { room: Room; beds: Bed[] } {
  const roomId = generateId();
  const room: Room = { id: roomId, name, type, capacity, genderPolicy, pricePerNight };
  const beds: Bed[] = Array.from({ length: capacity }, (_, i) => ({
    id: generateId(),
    roomId,
    bedNumber: i + 1,
  }));
  return { room, beds };
}

/**
 * 生成初始模拟数据
 */
export function createMockData(): StorageData {
  const rooms: Room[] = [];
  const beds: Bed[] = [];

  // 4人间男生房
  const r1 = createRoomWithBeds('橙光男生四人间', 'dorm_4', 4, 'male_only', 68);
  rooms.push(r1.room);
  beds.push(...r1.beds);

  // 4人间女生房
  const r2 = createRoomWithBeds('星语女生四人间', 'dorm_4', 4, 'female_only', 72);
  rooms.push(r2.room);
  beds.push(...r2.beds);

  // 6人间混住房
  const r3 = createRoomWithBeds('晚风混住六人间', 'dorm_6', 6, 'mixed', 58);
  rooms.push(r3.room);
  beds.push(...r3.beds);

  // 大床房（私人房）
  const r4 = createRoomWithBeds('望月大床房', 'private', 1, 'mixed', 188);
  rooms.push(r4.room);
  beds.push(...r4.beds);

  // 8人间混住房
  const r5 = createRoomWithBeds('山海混住八人间', 'dorm_8', 8, 'mixed', 48);
  rooms.push(r5.room);
  beds.push(...r5.beds);

  return { rooms, beds, bookings: [] };
}
