import { create } from 'zustand';
import type { Room, Bed, Booking, Gender, GenderFilter } from '../types';
import { roomStorage, bedStorage, bookingStorage } from '../utils/storage';
import { initializeDataIfNeeded } from '../data/seed';
import { calculateNights } from '../utils/date';
import { validatePhone, validateName } from '../utils/validation';

/**
 * 预订系统状态管理 Store
 */

// 单个住客表单数据
export interface GuestFormData {
  guestName: string;
  guestGender: Gender;
  phone: string;
}

// 多人预订表单数据
interface MultiBookingFormData {
  guests: GuestFormData[];
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
  guestCount: number;          // 预订人数
  selectedRoomId: string | null;
  selectedBedIds: string[];    // 选中的多个床位ID

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
  setGuestCount: (count: number) => void;
  selectRoom: (roomId: string | null) => void;
  toggleBed: (bedId: string) => void;  // 切换床位选中状态

  // 模态框控制
  openBookingModal: () => void;
  closeBookingModal: () => void;

  // 核心操作
  submitBooking: (formData: MultiBookingFormData) => { success: boolean; message: string };
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
  guestCount: 1,
  selectedRoomId: null,
  selectedBedIds: [],

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
    set({ checkInDate: date, selectedRoomId: null, selectedBedIds: [], guestCount: 1 });
  },

  /**
   * 设置离店日期
   */
  setCheckOutDate: (date: string) => {
    set({ checkOutDate: date, selectedRoomId: null, selectedBedIds: [], guestCount: 1 });
  },

  /**
   * 设置性别筛选
   */
  setGenderFilter: (filter: GenderFilter) => {
    set({ genderFilter: filter, selectedRoomId: null, selectedBedIds: [], guestCount: 1 });
  },

  /**
   * 设置预订人数
   */
  setGuestCount: (count: number) => {
    const safeCount = Math.max(1, Math.min(8, count));
    const { selectedBedIds } = get();
    // 如果减少人数后选中床位超出，截断
    const newSelectedBeds = selectedBedIds.slice(0, safeCount);
    set({ guestCount: safeCount, selectedBedIds: newSelectedBeds });
  },

  /**
   * 选择房间
   */
  selectRoom: (roomId: string | null) => {
    set({ selectedRoomId: roomId, selectedBedIds: [] });
  },

  /**
   * 切换床位选中状态（支持多选）
   */
  toggleBed: (bedId: string) => {
    const { selectedBedIds, guestCount } = get();
    const index = selectedBedIds.indexOf(bedId);
    if (index > -1) {
      // 已选中则取消
      set({ selectedBedIds: selectedBedIds.filter(id => id !== bedId) });
    } else {
      // 未选中则添加，但不能超过人数
      if (selectedBedIds.length < guestCount) {
        set({ selectedBedIds: [...selectedBedIds, bedId] });
      }
    }
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
   * 提交预订订单（支持多人多床位）
   */
  submitBooking: (formData: MultiBookingFormData) => {
    const { selectedRoomId, selectedBedIds, checkInDate, checkOutDate, rooms, beds, bookings, guestCount } = get();

    // 校验选中床位数量
    if (selectedBedIds.length !== guestCount) {
      return { success: false, message: `请选择${guestCount}个床位（当前已选${selectedBedIds.length}个）` };
    }

    if (!selectedRoomId) {
      return { success: false, message: '请先选择房间' };
    }

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) {
      return { success: false, message: '房间不存在' };
    }

    const nights = calculateNights(checkInDate, checkOutDate);

    // 校验每个住客信息
    const newBookings: Booking[] = [];
    let totalPriceAll = 0;
    const guestNames: string[] = [];

    for (let i = 0; i < guestCount; i++) {
      const guest = formData.guests[i];
      const bedId = selectedBedIds[i];
      const bed = beds.find(b => b.id === bedId);

      if (!guest) {
        return { success: false, message: `请填写第${i + 1}位住客信息` };
      }

      // 姓名校验
      if (!validateName(guest.guestName)) {
        return { success: false, message: `第${i + 1}位住客：请输入有效姓名` };
      }

      // 手机号校验
      if (!validatePhone(guest.phone)) {
        return { success: false, message: `第${i + 1}位住客：请输入正确的11位手机号` };
      }

      // 性别限制校验
      if (room.genderRestriction === 'female-only' && guest.guestGender !== 'female') {
        return { success: false, message: `第${i + 1}位住客：该房间仅限女生入住` };
      }
      if (room.genderRestriction === 'male-only' && guest.guestGender !== 'male') {
        return { success: false, message: `第${i + 1}位住客：该房间仅限男生入住` };
      }

      // 检查床位是否已被预订
      const isBooked = bookings.some(b =>
        b.status !== 'cancelled' &&
        b.bedId === bedId &&
        !(new Date(b.checkOutDate) <= new Date(checkInDate) || new Date(b.checkInDate) >= new Date(checkOutDate))
      );
      if (isBooked) {
        return { success: false, message: `${bed?.bedNumber}号床在所选日期已被预订，请重新选择` };
      }

      const pricePerGuest = room.pricePerNight * nights;
      totalPriceAll += pricePerGuest;
      guestNames.push(guest.guestName);

      newBookings.push({
        id: generateId(),
        roomId: selectedRoomId,
        bedId,
        guestName: guest.guestName.trim(),
        guestGender: guest.guestGender,
        phone: guest.phone.trim(),
        checkInDate,
        checkOutDate,
        totalPrice: pricePerGuest,
        status: 'confirmed',
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      });
    }

    // 更新状态和 localStorage
    const updatedBookings = [...bookings, ...newBookings];
    bookingStorage.save(updatedBookings);

    set({
      bookings: updatedBookings,
      showBookingModal: false,
      bookingSuccess: true,
      successMessage: `预订成功！${guestNames.join('、')}，共${guestCount}人·${nights}晚，总价¥${totalPriceAll}`,
      selectedBedIds: [],
      guestCount: 1,
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
    set({ selectedRoomId: null, selectedBedIds: [], guestCount: 1 });
  },
}));
