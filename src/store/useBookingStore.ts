import { create } from 'zustand';
import type { Room, Bed, Booking, Gender, GenderFilter } from '../types';
import { roomStorage, bedStorage, bookingStorage } from '../utils/storage';
import { initializeDataIfNeeded } from '../data/seed';
import { calculateNights } from '../utils/date';

/**
 * 预订系统状态管理 Store
 */

// 预订表单数据类型
interface BookingFormData {
  guestName: string;
  guestGender: Gender;
  phone: string;
  notes: string;
}

// Store 状态接口
interface BookingState {
  // 数据
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];

  // 预订页选择状态
  checkInDate: string;
  checkOutDate: string;
  genderFilter: GenderFilter;
  selectedRoomId: string | null;
  selectedBedId: string | null;

  // UI 状态
  showBookingModal: boolean;
  bookingSuccess: boolean;
  successMessage: string;

  // 初始化和数据操作
  initializeStore: () => void;

  // 选择操作
  setCheckInDate: (date: string) => void;
  setCheckOutDate: (date: string) => void;
  setGenderFilter: (filter: GenderFilter) => void;
  selectRoom: (roomId: string | null) => void;
  selectBed: (bedId: string | null) => void;

  // 模态框控制
  openBookingModal: () => void;
  closeBookingModal: () => void;

  // 核心操作
  submitBooking: (formData: BookingFormData) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;

  // 重置操作
  resetSelection: () => void;
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // 初始空数据，initializeStore 时填充
  rooms: [],
  beds: [],
  bookings: [],

  // 默认日期：今天入住，明天离店
  checkInDate: '',
  checkOutDate: '',
  genderFilter: 'all',
  selectedRoomId: null,
  selectedBedId: null,

  showBookingModal: false,
  bookingSuccess: false,
  successMessage: '',

  /**
   * 初始化 Store，从 localStorage 加载数据或使用默认数据
   */
  initializeStore: () => {
    const { rooms, beds, bookings } = initializeDataIfNeeded();

    // 设置默认日期
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = today.toISOString().split('T')[0];
    const checkOut = tomorrow.toISOString().split('T')[0];

    set({
      rooms,
      beds,
      bookings,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });
  },

  /**
   * 设置入住日期
   */
  setCheckInDate: (date: string) => {
    set({ checkInDate: date, selectedRoomId: null, selectedBedId: null });
  },

  /**
   * 设置离店日期
   */
  setCheckOutDate: (date: string) => {
    set({ checkOutDate: date, selectedRoomId: null, selectedBedId: null });
  },

  /**
   * 设置性别筛选
   */
  setGenderFilter: (filter: GenderFilter) => {
    set({ genderFilter: filter, selectedRoomId: null, selectedBedId: null });
  },

  /**
   * 选择房间
   */
  selectRoom: (roomId: string | null) => {
    set({ selectedRoomId: roomId, selectedBedId: null });
  },

  /**
   * 选择床位
   */
  selectBed: (bedId: string | null) => {
    set({ selectedBedId: bedId });
  },

  /**
   * 打开预订表单弹窗
   */
  openBookingModal: () => {
    set({ showBookingModal: true, bookingSuccess: false });
  },

  /**
   * 关闭预订表单弹窗
   */
  closeBookingModal: () => {
    set({ showBookingModal: false, bookingSuccess: false, successMessage: '' });
  },

  /**
   * 提交预订订单
   */
  submitBooking: (formData: BookingFormData) => {
    const { selectedRoomId, selectedBedId, checkInDate, checkOutDate, rooms, bookings } = get();

    if (!selectedRoomId || !selectedBedId) {
      return { success: false, message: '请先选择床位' };
    }

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) {
      return { success: false, message: '房间不存在' };
    }

    // 检查性别限制
    if (room.genderRestriction === 'female-only' && formData.guestGender !== 'female') {
      return { success: false, message: '该房间仅限女生入住' };
    }
    if (room.genderRestriction === 'male-only' && formData.guestGender !== 'male') {
      return { success: false, message: '该房间仅限男生入住' };
    }

    // 检查床位是否已被预订
    const isBooked = bookings.some(b =>
      b.status !== 'cancelled' &&
      b.bedId === selectedBedId &&
      !(new Date(b.checkOutDate) <= new Date(checkInDate) || new Date(b.checkInDate) >= new Date(checkOutDate))
    );
    if (isBooked) {
      return { success: false, message: '该床位在所选日期已被预订，请重新选择' };
    }

    // 计算价格
    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = room.pricePerNight * nights;

    // 创建新订单
    const newBooking: Booking = {
      id: generateId(),
      roomId: selectedRoomId,
      bedId: selectedBedId,
      guestName: formData.guestName,
      guestGender: formData.guestGender,
      phone: formData.phone,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'confirmed',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    // 更新状态和 localStorage
    const newBookings = [...bookings, newBooking];
    bookingStorage.save(newBookings);
    set({
      bookings: newBookings,
      showBookingModal: false,
      bookingSuccess: true,
      successMessage: `预订成功！${formData.guestName}，您已预订${room.name}，共${nights}晚，总价¥${totalPrice}`,
      selectedBedId: null,
    });

    return { success: true, message: '' };
  },

  /**
   * 取消预订
   */
  cancelBooking: (bookingId: string) => {
    const { bookings } = get();
    const newBookings = bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    bookingStorage.save(newBookings);
    set({ bookings: newBookings });
  },

  /**
   * 重置选择状态
   */
  resetSelection: () => {
    set({ selectedRoomId: null, selectedBedId: null });
  },
}));
