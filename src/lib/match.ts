// 自动拼房算法
// 根据"人数 + 性别构成 + 性别偏好"自动推荐最合适的床位组合

import type { Bed, Booking, Gender, GenderPreference, Room } from "@/lib/storage";
import { getRoomCurrentGender, isBedOccupied } from "@/lib/storage";

export interface MatchInput {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
  /** 入住人列表（每个人含性别） */
  guests: { gender: Gender }[];
  /** 性别偏好 */
  preference: GenderPreference;
  checkIn: string;
  checkOut: string;
}

/**
 * 房间评分：分数越高越优先推荐
 *  - 完全契合性别（同性房）：+100
 *  - 已有同性别旅客的混住房：+60
 *  - 全空闲混住房：+40
 *  - 单层楼内可一次性满足全部人数：+20
 *  - 价格越低分数微调（每元 -0.1，<=10）
 */
function scoreRoom(
  room: Room,
  freeBeds: Bed[],
  needed: number,
  guestsGender: Gender[],
  currentGender: Gender | null,
  preference: GenderPreference,
): number {
  if (freeBeds.length < needed) return -Infinity;

  // 偏好不匹配则直接淘汰
  if (preference === "male" && room.genderType !== "male") return -Infinity;
  if (preference === "female" && room.genderType !== "female") return -Infinity;
  if (preference === "mixed" && room.genderType !== "mixed") return -Infinity;

  let score = 0;
  const allMale = guestsGender.every((g) => g === "male");
  const allFemale = guestsGender.every((g) => g === "female");

  if (room.genderType === "male") {
    if (!allMale) return -Infinity;
    score += 100;
  } else if (room.genderType === "female") {
    if (!allFemale) return -Infinity;
    score += 100;
  } else {
    // 混住房
    if (currentGender === null) score += 40;
    else if (
      (currentGender === "male" && allMale) ||
      (currentGender === "female" && allFemale)
    ) {
      score += 60;
    } else {
      score += 20;
    }
  }

  if (freeBeds.length >= needed) score += 20;
  score -= Math.min(10, room.pricePerNight * 0.1);
  return score;
}

/**
 * 自动匹配床位
 * 返回推荐的床位 ID 数组（按 guests 顺序），或 null 表示无可行方案
 */
export function autoMatch(input: MatchInput): { bedIds: string[]; roomId: string } | null {
  const { rooms, beds, bookings, guests, preference, checkIn, checkOut } = input;
  const needed = guests.length;
  if (needed === 0) return null;

  const guestsGender = guests.map((g) => g.gender);

  // 计算每间房的可用空闲床位与得分
  const ranked = rooms
    .map((room) => {
      const roomBeds = beds.filter((b) => b.roomId === room.id);
      const freeBeds = roomBeds.filter((b) => !isBedOccupied(b.id, checkIn, checkOut, bookings));
      const currentGender = getRoomCurrentGender(room, checkIn, checkOut, beds, bookings);
      const score = scoreRoom(room, freeBeds, needed, guestsGender, currentGender, preference);
      return { room, freeBeds, score };
    })
    .filter((x) => x.score > -Infinity)
    // 优先选 score 高，其次楼层低，其次价格低
    .sort((a, b) => b.score - a.score || a.room.floor - b.room.floor || a.room.pricePerNight - b.room.pricePerNight);

  const best = ranked[0];
  if (!best) return null;

  // 选取最连续的床位（按 index 排序后取前 needed 个）
  const chosen = [...best.freeBeds].sort((a, b) => a.index - b.index).slice(0, needed);
  return { bedIds: chosen.map((b) => b.id), roomId: best.room.id };
}
