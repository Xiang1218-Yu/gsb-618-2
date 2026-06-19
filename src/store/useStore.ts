import { create } from 'zustand';
import type { Room, Bed, Booking, Gender, StorageData, BookingStatus } from '@/types';
import { loadFromStorage, saveToStorage, generateId, getTodayStr } from '@/utils/storage';
import { createMockData } from '@/utils/mockData';

/**
 * 判断预订在指定日期是否有效（入住<=日期<退房）
 */
function isBookingActiveOnDate(booking: Booking, dateStr: string): boolean {
  if (booking.status === 'cancelled') return false;
  return booking.checkInDate <= dateStr && dateStr < booking.checkOutDate;
}

interface AppState {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
  selectedDate: string;
  genderFilter: Gender | 'all';

  // 设置筛选条件
  setGenderFilter: (filter: Gender | 'all') => void;
  setSelectedDate: (date: string) => void;

  // 获取指定房间在指定日期可用的床位
  getAvailableBeds: (roomId: string, dateStr: string) => Bed[];

  // 获取指定日期某床位的预订信息
  getBedBooking: (bedId: string, dateStr: string) => Booking | undefined;

  // 检查房间在指定日期的性别构成（用于拼房提示）
  getRoomGenderInfo: (roomId: string, dateStr: string) => {
    males: number;
    females: number;
    total: number;
  };

  // 验证能否在某床位预订（考虑拼房性别匹配）
  canBookBed: (
    roomId: string,
    bedId: string,
    guestGender: Gender,
    dateStr: string
  ) => { can: boolean; reason?: string };

  // 添加预订
  addBooking: (data: {
    roomId: string;
    bedId: string;
    guestName: string;
    guestGender: Gender;
    phone: string;
    checkInDate: string;
    checkOutDate: string;
  }) => { success: boolean; message: string; bookingId?: string };

  // 取消预订
  cancelBooking: (bookingId: string) => void;

  // 办理入住（标记为已入住）
  checkIn: (bookingId: string) => void;

  // 办理退房（直接取消或标记为完成，这里简化为取消）
  checkOut: (bookingId: string) => void;

  // 添加新房间
  addRoom: (data: {
    name: string;
    type: Room['type'];
    capacity: number;
    genderPolicy: Room['genderPolicy'];
    pricePerNight: number;
  }) => void;

  // 重置所有数据（使用初始mock数据）
  resetData: () => void;

  // 获取今日统计数据
  getTodayStats: () => {
    totalRooms: number;
    todayCheckIn: number;
    todayCheckOut: number;
    occupiedBeds: number;
    totalBeds: number;
  };
}

/**
 * 初始化数据：从localStorage读取，若无则使用mock数据
 */
function initData(): StorageData {
  const stored = loadFromStorage();
  if (stored && stored.rooms && stored.beds) {
    return stored;
  }
  const mock = createMockData();
  saveToStorage(mock);
  return mock;
}

const initialData = initData();

export const useStore = create<AppState>((set, get) => ({
  rooms: initialData.rooms,
  beds: initialData.beds,
  bookings: initialData.bookings,
  selectedDate: getTodayStr(),
  genderFilter: 'all',

  setGenderFilter: (filter) => set({ genderFilter: filter }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  getAvailableBeds: (roomId, dateStr) => {
    const { beds, bookings } = get();
    const roomBeds = beds.filter((b) => b.roomId === roomId);
    const occupiedBedIds = new Set(
      bookings
        .filter((b) => isBookingActiveOnDate(b, dateStr))
        .map((b) => b.bedId)
    );
    return roomBeds.filter((b) => !occupiedBedIds.has(b.id));
  },

  getBedBooking: (bedId, dateStr) => {
    const { bookings } = get();
    return bookings.find(
      (b) => b.bedId === bedId && isBookingActiveOnDate(b, dateStr)
    );
  },

  getRoomGenderInfo: (roomId, dateStr) => {
    const { bookings } = get();
    const activeBookings = bookings.filter(
      (b) => b.roomId === roomId && isBookingActiveOnDate(b, dateStr)
    );
    let males = 0;
    let females = 0;
    activeBookings.forEach((b) => {
      if (b.guestGender === 'male') males++;
      else females++;
    });
    return { males, females, total: activeBookings.length };
  },

  canBookBed: (roomId, _bedId, guestGender, dateStr) => {
    const { rooms, getRoomGenderInfo } = get();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return { can: false, reason: '房间不存在' };

    // 私人房不需要拼房校验
    if (room.type === 'private') {
      return { can: true };
    }

    // 严格性别房间
    if (room.genderPolicy === 'male_only' && guestGender !== 'male') {
      return { can: false, reason: '此房间仅限男性入住' };
    }
    if (room.genderPolicy === 'female_only' && guestGender !== 'female') {
      return { can: false, reason: '此房间仅限女性入住' };
    }

    // 混住房检查当前入住人员性别
    if (room.genderPolicy === 'mixed') {
      const info = getRoomGenderInfo(roomId, dateStr);
      if (info.total > 0) {
        if (guestGender === 'male' && info.females > 0) {
          return {
            can: false,
            reason: '该房间已有女性住客，为避免混住不便，请选择其他床位或房间',
          };
        }
        if (guestGender === 'female' && info.males > 0) {
          return {
            can: false,
            reason: '该房间已有男性住客，为避免混住不便，请选择其他床位或房间',
          };
        }
      }
    }

    return { can: true };
  },

  addBooking: (data) => {
    const { beds, canBookBed } = get();

    // 检查床位是否存在且属于该房间
    const bed = beds.find((b) => b.id === data.bedId && b.roomId === data.roomId);
    if (!bed) {
      return { success: false, message: '床位信息错误' };
    }

    // 检查日期范围内每天是否都可预订（简化：检查入住日和退房前一天）
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const datesToCheck: string[] = [];
    const d = new Date(checkIn);
    while (d < checkOut) {
      datesToCheck.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }

    for (const dateStr of datesToCheck) {
      const { getBedBooking } = get();
      const existing = getBedBooking(data.bedId, dateStr);
      if (existing) {
        return {
          success: false,
          message: `${dateStr} 该床位已被预订，请选择其他日期或床位`,
        };
      }
      const check = canBookBed(data.roomId, data.bedId, data.guestGender, dateStr);
      if (!check.can) {
        return { success: false, message: check.reason || '无法预订该床位' };
      }
    }

    const newBooking: Booking = {
      id: generateId(),
      bedId: data.bedId,
      roomId: data.roomId,
      guestName: data.guestName,
      guestGender: data.guestGender,
      phone: data.phone,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const newBookings = [...state.bookings, newBooking];
      const newData = { rooms: state.rooms, beds: state.beds, bookings: newBookings };
      saveToStorage(newData);
      return { bookings: newBookings };
    });

    return { success: true, message: '预订成功！', bookingId: newBooking.id };
  },

  cancelBooking: (bookingId) => {
    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
      );
      saveToStorage({ rooms: state.rooms, beds: state.beds, bookings: newBookings });
      return { bookings: newBookings };
    });
  },

  checkIn: (bookingId) => {
    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'checked_in' as BookingStatus } : b
      );
      saveToStorage({ rooms: state.rooms, beds: state.beds, bookings: newBookings });
      return { bookings: newBookings };
    });
  },

  checkOut: (bookingId) => {
    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
      );
      saveToStorage({ rooms: state.rooms, beds: state.beds, bookings: newBookings });
      return { bookings: newBookings };
    });
  },

  addRoom: (data) => {
    const roomId = generateId();
    const newRoom: Room = {
      id: roomId,
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      genderPolicy: data.genderPolicy,
      pricePerNight: data.pricePerNight,
    };
    const newBeds: Bed[] = Array.from({ length: data.capacity }, (_, i) => ({
      id: generateId(),
      roomId,
      bedNumber: i + 1,
    }));

    set((state) => {
      const updated = {
        rooms: [...state.rooms, newRoom],
        beds: [...state.beds, ...newBeds],
        bookings: state.bookings,
      };
      saveToStorage(updated);
      return updated;
    });
  },

  resetData: () => {
    const mock = createMockData();
    saveToStorage(mock);
    set({ rooms: mock.rooms, beds: mock.beds, bookings: mock.bookings });
  },

  getTodayStats: () => {
    const { rooms, beds, bookings, selectedDate } = get();
    const today = selectedDate;
    const todayCheckIn = bookings.filter(
      (b) => b.status !== 'cancelled' && b.checkInDate === today
    ).length;
    const todayCheckOut = bookings.filter(
      (b) => b.status !== 'cancelled' && b.checkOutDate === today
    ).length;
    const occupiedBeds = bookings.filter((b) => isBookingActiveOnDate(b, today)).length;
    return {
      totalRooms: rooms.length,
      todayCheckIn,
      todayCheckOut,
      occupiedBeds,
      totalBeds: beds.length,
    };
  },
}));
