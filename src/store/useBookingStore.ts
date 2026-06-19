import { create } from 'zustand';
import type { Room, Bed, Booking, BookingFormData } from '../types';
import { saveRooms, saveBeds, saveBookings, loadRooms, loadBeds, loadBookings, isInitialized, markInitialized, generateId, getTodayString } from '../utils/storage';
import { initializeData } from '../utils/mockData';

// 预订状态Store接口
interface BookingState {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
  selectedBeds: string[];
  selectedRoomId: string | null;
  checkInDate: string;
  checkOutDate: string;
  currentView: 'booking' | 'admin';
  isLoaded: boolean;
  
  // 初始化数据
  initData: () => void;
  
  // 选中/取消选中床位
  toggleBedSelection: (bedId: string) => void;
  clearSelectedBeds: () => void;
  
  // 选择房间
  selectRoom: (roomId: string | null) => void;
  
  // 设置日期
  setCheckInDate: (date: string) => void;
  setCheckOutDate: (date: string) => void;
  
  // 切换视图
  setCurrentView: (view: 'booking' | 'admin') => void;
  
  // 创建预订
  createBooking: (formData: BookingFormData) => boolean;
  
  // 取消预订
  cancelBooking: (bookingId: string) => void;
  
  // 办理入住
  checkIn: (bookingId: string) => void;
  
  // 办理退房
  checkOut: (bookingId: string) => void;
  
  // 重置数据
  resetData: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  rooms: [],
  beds: [],
  bookings: [],
  selectedBeds: [],
  selectedRoomId: null,
  checkInDate: getTodayString(),
  checkOutDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })(),
  currentView: 'booking',
  isLoaded: false,
  
  // 初始化数据：从本地存储加载或创建初始数据
  initData: () => {
    if (get().isLoaded) return;
    
    let rooms: Room[] | null = null;
    let beds: Bed[] | null = null;
    let bookings: Booking[] | null = null;
    
    if (isInitialized()) {
      rooms = loadRooms();
      beds = loadBeds();
      bookings = loadBookings();
    }
    
    if (!rooms || !beds || !bookings) {
      const initialData = initializeData();
      rooms = initialData.rooms;
      beds = initialData.beds;
      bookings = initialData.bookings;
      saveRooms(rooms);
      saveBeds(beds);
      saveBookings(bookings);
      markInitialized();
    }
    
    set({ rooms, beds, bookings, isLoaded: true });
  },
  
  // 切换床位选中状态
  toggleBedSelection: (bedId: string) => {
    const { selectedBeds, beds } = get();
    const bed = beds.find(b => b.id === bedId);
    
    if (!bed || bed.status !== 'available') return;
    
    if (selectedBeds.includes(bedId)) {
      set({ selectedBeds: selectedBeds.filter(id => id !== bedId) });
    } else {
      set({ selectedBeds: [...selectedBeds, bedId] });
    }
  },
  
  // 清空选中的床位
  clearSelectedBeds: () => {
    set({ selectedBeds: [] });
  },
  
  // 选择房间
  selectRoom: (roomId: string | null) => {
    set({ selectedRoomId: roomId, selectedBeds: [] });
  },
  
  // 设置入住日期
  setCheckInDate: (date: string) => {
    set({ checkInDate: date });
    if (date >= get().checkOutDate) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      set({ checkOutDate: nextDay.toISOString().split('T')[0] });
    }
  },
  
  // 设置离店日期
  setCheckOutDate: (date: string) => {
    set({ checkOutDate: date });
  },
  
  // 切换视图
  setCurrentView: (view: 'booking' | 'admin') => {
    set({ currentView: view, selectedRoomId: null, selectedBeds: [] });
  },
  
  // 创建预订
  createBooking: (formData: BookingFormData) => {
    const { selectedBeds, rooms, beds, bookings, checkInDate, checkOutDate } = get();
    
    if (selectedBeds.length === 0) return false;
    
    const newBookings: Booking[] = [];
    const updatedBeds = [...beds];
    
    selectedBeds.forEach(bedId => {
      const bed = updatedBeds.find(b => b.id === bedId);
      if (bed && bed.status === 'available') {
        newBookings.push({
          id: generateId(),
          bedId,
          roomId: bed.roomId,
          guestName: formData.guestName,
          gender: formData.gender,
          phone: formData.phone,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          genderPreference: formData.genderPreference,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
        });
        
        // 更新床位状态为已预订
        const bedIndex = updatedBeds.findIndex(b => b.id === bedId);
        if (bedIndex !== -1) {
          updatedBeds[bedIndex] = { ...updatedBeds[bedIndex], status: 'booked' };
        }
      }
    });
    
    const allBookings = [...bookings, ...newBookings];
    
    set({ 
      bookings: allBookings, 
      beds: updatedBeds,
      selectedBeds: [],
      selectedRoomId: null,
    });
    
    saveBeds(updatedBeds);
    saveBookings(allBookings);
    
    return true;
  },
  
  // 取消预订
  cancelBooking: (bookingId: string) => {
    const { bookings, beds } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    // 更新预订状态为已取消
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    
    // 释放床位
    const updatedBeds = beds.map(b => 
      b.id === booking.bedId ? { ...b, status: 'available' as const } : b
    );
    
    set({ bookings: updatedBookings, beds: updatedBeds });
    saveBookings(updatedBookings);
    saveBeds(updatedBeds);
  },
  
  // 办理入住
  checkIn: (bookingId: string) => {
    const { bookings } = get();
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'checked_in' as const } : b
    );
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
  },
  
  // 办理退房
  checkOut: (bookingId: string) => {
    const { bookings, beds } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'checked_out' as const } : b
    );
    
    const updatedBeds = beds.map(b => 
      b.id === booking.bedId ? { ...b, status: 'available' as const } : b
    );
    
    set({ bookings: updatedBookings, beds: updatedBeds });
    saveBookings(updatedBookings);
    saveBeds(updatedBeds);
  },
  
  // 重置所有数据
  resetData: () => {
    const initialData = initializeData();
    set({ 
      rooms: initialData.rooms, 
      beds: initialData.beds, 
      bookings: initialData.bookings,
      selectedBeds: [],
      selectedRoomId: null,
    });
    saveRooms(initialData.rooms);
    saveBeds(initialData.beds);
    saveBookings(initialData.bookings);
  },
}));
