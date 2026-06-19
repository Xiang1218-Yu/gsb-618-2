// 数据模型与本地存储工具
// 所有数据通过 localStorage 持久化，模块负责读写与初始化

// ========= 类型定义 =========

/** 性别 */
export type Gender = "male" | "female";

/** 房间性别策略：男生间 / 女生间 / 混住间 */
export type RoomGenderType = "male" | "female" | "mixed";

/** 旅客的性别偏好筛选 */
export type GenderPreference = "any" | "male" | "female" | "mixed";

/** 房间 */
export interface Room {
  id: string;
  name: string;
  /** 房间性别策略 */
  genderType: RoomGenderType;
  /** 容量（床位数） */
  capacity: number;
  /** 单床/晚 价格 */
  pricePerNight: number;
  /** 楼层（用于排序展示） */
  floor: number;
}

/** 床位 */
export interface Bed {
  id: string;
  roomId: string;
  /** 床位序号（1 起） */
  index: number;
  /** 上下铺位置 */
  position: "upper" | "lower";
}

/** 预订记录 */
export interface Booking {
  id: string;
  bedId: string;
  guestName: string;
  gender: Gender;
  phone: string;
  /** 入住日期 yyyy-mm-dd */
  checkIn: string;
  /** 离店日期 yyyy-mm-dd */
  checkOut: string;
  /** 创建时间 ISO */
  createdAt: string;
}

// ========= localStorage Keys =========
const KEYS = {
  rooms: "hostel.rooms",
  beds: "hostel.beds",
  bookings: "hostel.bookings",
  adminToken: "hostel.admin.token",
};

// ========= 通用读写 =========
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ========= 默认示例数据 =========

/** 生成示例房间与床位 */
function buildSeed(): { rooms: Room[]; beds: Bed[] } {
  const rooms: Room[] = [
    { id: "r-m6", name: "森林男士间", genderType: "male", capacity: 6, pricePerNight: 88, floor: 2 },
    { id: "r-f6", name: "栖光女士间", genderType: "female", capacity: 6, pricePerNight: 88, floor: 2 },
    { id: "r-mix4", name: "旅人混住间", genderType: "mixed", capacity: 4, pricePerNight: 98, floor: 3 },
    { id: "r-fam4", name: "山涧家庭间", genderType: "mixed", capacity: 4, pricePerNight: 148, floor: 3 },
  ];

  const beds: Bed[] = [];
  for (const r of rooms) {
    for (let i = 1; i <= r.capacity; i++) {
      beds.push({
        id: `${r.id}-b${i}`,
        roomId: r.id,
        index: i,
        // 偶数为上铺，奇数为下铺（仅作示例）
        position: i % 2 === 0 ? "upper" : "lower",
      });
    }
  }
  return { rooms, beds };
}

// ========= 公共 API =========

/** 初始化数据（仅当不存在时写入） */
export function ensureSeed(): void {
  if (!localStorage.getItem(KEYS.rooms) || !localStorage.getItem(KEYS.beds)) {
    const { rooms, beds } = buildSeed();
    write(KEYS.rooms, rooms);
    write(KEYS.beds, beds);
  }
  if (!localStorage.getItem(KEYS.bookings)) {
    write<Booking[]>(KEYS.bookings, []);
  }
}

/** 强制重置为示例数据 */
export function resetSeed(): void {
  const { rooms, beds } = buildSeed();
  write(KEYS.rooms, rooms);
  write(KEYS.beds, beds);
  write<Booking[]>(KEYS.bookings, []);
}

/** 仅清空预订 */
export function clearBookings(): void {
  write<Booking[]>(KEYS.bookings, []);
}

export function getRooms(): Room[] {
  return read<Room[]>(KEYS.rooms, []);
}

export function getBeds(): Bed[] {
  return read<Bed[]>(KEYS.beds, []);
}

export function getBookings(): Booking[] {
  return read<Booking[]>(KEYS.bookings, []);
}

export function saveBookings(bookings: Booking[]): void {
  write(KEYS.bookings, bookings);
}

/** 新增预订（批量） */
export function addBookings(newOnes: Booking[]): void {
  const current = getBookings();
  saveBookings([...current, ...newOnes]);
}

/** 删除单条预订 */
export function removeBooking(id: string): void {
  saveBookings(getBookings().filter((b) => b.id !== id));
}

/** 更新单条预订（按 id 匹配） */
export function updateBooking(id: string, patch: Partial<Omit<Booking, "id">>): void {
  const list = getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBookings(list);
}

/** 新增单条预订 */
export function addBooking(booking: Booking): void {
  saveBookings([...getBookings(), booking]);
}

// ========= 房间 CRUD =========

/** 保存房间列表 */
export function saveRooms(rooms: Room[]): void {
  write(KEYS.rooms, rooms);
}

/** 保存床位列表 */
export function saveBeds(beds: Bed[]): void {
  write(KEYS.beds, beds);
}

/**
 * 新增房间：自动按 capacity 创建对应床位
 * 返回新生成的房间 id
 */
export function addRoom(input: Omit<Room, "id">): string {
  const id = makeId("r");
  const room: Room = { ...input, id };
  saveRooms([...getRooms(), room]);

  // 同步生成床位
  const newBeds: Bed[] = [];
  for (let i = 1; i <= input.capacity; i++) {
    newBeds.push({
      id: `${id}-b${i}`,
      roomId: id,
      index: i,
      position: i % 2 === 0 ? "upper" : "lower",
    });
  }
  saveBeds([...getBeds(), ...newBeds]);
  return id;
}

/**
 * 更新房间：若 capacity 变化，自动同步床位
 *  - 增加：在末尾追加新床位
 *  - 减少：先尝试删除"无预订"的尾部床位；若有预订占用则抛出错误
 */
export function updateRoom(id: string, patch: Partial<Omit<Room, "id">>): void {
  const rooms = getRooms();
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("房间不存在");
  const old = rooms[idx];
  const next: Room = { ...old, ...patch };
  rooms[idx] = next;
  saveRooms(rooms);

  if (typeof patch.capacity === "number" && patch.capacity !== old.capacity) {
    let beds = getBeds();
    const roomBeds = beds.filter((b) => b.roomId === id).sort((a, b) => a.index - b.index);
    const otherBeds = beds.filter((b) => b.roomId !== id);

    if (patch.capacity > old.capacity) {
      // 追加床位
      const toAdd: Bed[] = [];
      for (let i = old.capacity + 1; i <= patch.capacity; i++) {
        toAdd.push({
          id: `${id}-b${i}-${Math.random().toString(36).slice(2, 5)}`,
          roomId: id,
          index: i,
          position: i % 2 === 0 ? "upper" : "lower",
        });
      }
      beds = [...otherBeds, ...roomBeds, ...toAdd];
    } else {
      // 删除尾部床位（仅删除无预订占用的）
      const bookings = getBookings();
      const occupiedBedIds = new Set(bookings.map((bk) => bk.bedId));
      const removeCount = old.capacity - patch.capacity;
      const removable = roomBeds.slice(-removeCount);
      const blocked = removable.find((b) => occupiedBedIds.has(b.id));
      if (blocked) {
        // 还原房间容量
        rooms[idx] = old;
        saveRooms(rooms);
        throw new Error(`床位 #${blocked.index} 仍有预订，无法缩减容量`);
      }
      const removeIds = new Set(removable.map((b) => b.id));
      const remained = roomBeds.filter((b) => !removeIds.has(b.id));
      beds = [...otherBeds, ...remained];
    }
    saveBeds(beds);
  }
}

/**
 * 删除房间：会级联删除该房间下的床位与对应预订
 */
export function removeRoom(id: string): void {
  saveRooms(getRooms().filter((r) => r.id !== id));
  const removedBedIds = new Set(getBeds().filter((b) => b.roomId === id).map((b) => b.id));
  saveBeds(getBeds().filter((b) => b.roomId !== id));
  saveBookings(getBookings().filter((bk) => !removedBedIds.has(bk.bedId)));
}

// ========= 床位 CRUD =========

/** 新增单张床位（追加到房间） */
export function addBed(roomId: string, position: "upper" | "lower" = "lower"): Bed {
  const beds = getBeds();
  const roomBeds = beds.filter((b) => b.roomId === roomId);
  const maxIndex = roomBeds.reduce((m, b) => Math.max(m, b.index), 0);
  const bed: Bed = {
    id: makeId(`${roomId}-b`),
    roomId,
    index: maxIndex + 1,
    position,
  };
  saveBeds([...beds, bed]);
  // 同步房间 capacity
  const rooms = getRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    room.capacity = roomBeds.length + 1;
    saveRooms(rooms);
  }
  return bed;
}

/** 更新床位（位置/序号） */
export function updateBed(id: string, patch: Partial<Omit<Bed, "id" | "roomId">>): void {
  const beds = getBeds().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBeds(beds);
}

/**
 * 删除单张床位：若有预订占用则抛出错误
 */
export function removeBed(id: string): void {
  const bookings = getBookings();
  if (bookings.some((bk) => bk.bedId === id)) {
    throw new Error("该床位仍有预订，无法删除");
  }
  const target = getBeds().find((b) => b.id === id);
  if (!target) return;
  saveBeds(getBeds().filter((b) => b.id !== id));
  // 同步房间 capacity
  const rooms = getRooms();
  const room = rooms.find((r) => r.id === target.roomId);
  if (room) {
    room.capacity = Math.max(0, room.capacity - 1);
    saveRooms(rooms);
  }
}

// ========= 业务工具 =========

/**
 * 判断一段日期 [aStart, aEnd) 与 [bStart, bEnd) 是否重叠
 * 用日期字符串比较（yyyy-mm-dd）即可保证字典序与时间序一致
 */
export function isOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * 给定日期范围，判断某床位是否被占用
 */
export function isBedOccupied(bedId: string, checkIn: string, checkOut: string, bookings = getBookings()): boolean {
  return bookings.some((b) => b.bedId === bedId && isOverlap(b.checkIn, b.checkOut, checkIn, checkOut));
}

/**
 * 计算某房间在指定日期范围内被占用的"主导性别"
 * 如果房间是 male/female 房，自然返回该性别；
 * 如果是 mixed 房，则根据当前已入住的旅客返回 male/female/null
 */
export function getRoomCurrentGender(
  room: Room,
  checkIn: string,
  checkOut: string,
  beds = getBeds(),
  bookings = getBookings(),
): Gender | null {
  if (room.genderType === "male") return "male";
  if (room.genderType === "female") return "female";
  // 混住房：取该房间内日期重叠的预订
  const bedIds = beds.filter((b) => b.roomId === room.id).map((b) => b.id);
  const inRange = bookings.filter(
    (bk) => bedIds.includes(bk.bedId) && isOverlap(bk.checkIn, bk.checkOut, checkIn, checkOut),
  );
  if (inRange.length === 0) return null;
  const males = inRange.filter((x) => x.gender === "male").length;
  const females = inRange.length - males;
  if (males === females) return null; // 混住中
  return males > females ? "male" : "female";
}

/** 简单 ID 生成器 */
export function makeId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 计算入住天数（至少 1） */
export function calcNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (isNaN(a) || isNaN(b) || b <= a) return 0;
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** 今天的 yyyy-mm-dd */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 明天的 yyyy-mm-dd */
export function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ========= 管理端登录态 =========
export function setAdminToken(token: string): void {
  localStorage.setItem(KEYS.adminToken, token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(KEYS.adminToken);
}

export function clearAdminToken(): void {
  localStorage.removeItem(KEYS.adminToken);
}
