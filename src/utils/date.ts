/**
 * 日期工具函数
 */

/**
 * 计算两个日期之间的天数（入住晚数）
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * 获取今天日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  const today = new Date();
  return formatDate(today);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取明天日期字符串
 */
export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}

/**
 * 判断两个日期区间是否有重叠（用于检查床位是否已被预订）
 */
export function datesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  // 区间重叠：不是 (end1 <= start2 或 start1 >= end2)
  return !(e1 <= s2 || s1 >= e2);
}
