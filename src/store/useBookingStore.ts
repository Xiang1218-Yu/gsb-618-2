import { create } from 'zustand';
import type { Room, Bed, Booking, BookingFormData, Gender, GenderPreference, RoomType, BedPosition, BedStatus } from '../types';
import { saveRooms, saveBeds, saveBookings, loadRooms, loadBeds, loadBookings, isInitialized, markInitialized, generateId, getTodayString } from '../utils/storage';
import { initializeData, generateBedsForRooms } from '../utils/mockData';

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
  guestGender: Gender;
  genderPreference: GenderPreference;
  adminTab: 'dashboard' | 'rooms' | 'beds' | 'bookings';
  
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
  
  // 设置管理后台标签页
  setAdminTab: (tab: 'dashboard' | 'rooms' | 'beds' | 'bookings') => void;
  
  // 设置旅客性别和偏好
  setGuestGender: (gender: Gender) => void;
  setGenderPreference: (preference: GenderPreference) => void;
  
  // 校验性别与房型是否匹配
  validateGenderRoomMatch: (gender: Gender, roomType: RoomType) => { valid: boolean; message: string };
  
  // 创建预订
  createBooking: (formData: BookingFormData) => { success: boolean; message: string };
  
  // 更新预订信息
  updateBooking: (bookingId: string, updates: Partial<Booking>) => { success: boolean; message: string };
  
  // 删除预订（彻底删除记录）
  deleteBooking: (bookingId: string) => void;
  
  // 取消预订
  cancelBooking: (bookingId: string) => void;
  
  // 办理入住
  checkIn: (bookingId: string) => void;
  
  // 办理退房
  checkOut: (bookingId: string) => void;
  
  // ========== 房间CRUD ==========
  addRoom: (roomData: Omit<Room, 'id'>) => { success: boolean; message: string };
  updateRoom: (roomId: string, updates: Partial<Room>) => { success: boolean; message: string };
  deleteRoom: (roomId: string) => { success: boolean; message: string };
  
  // ========== 床位CRUD ==========
  addBed: (roomId: string, position: BedPosition) => { success: boolean; message: string };
  updateBed: (bedId: string, updates: Partial<Bed>) => { success: boolean; message: string };
  deleteBed: (bedId: string) => { success: boolean; message: string };
  toggleBedMaintenance: (bedId: string) => void;
  
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
  adminTab: 'dashboard',
  isLoaded: false,
  guestGender: 'male',
  genderPreference: 'male_only',
  
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
    set({ currentView: view, selectedRoomId: null, selectedBeds: [], adminTab: 'dashboard' });
  },
  
  // 设置管理后台标签页
  setAdminTab: (tab: 'dashboard' | 'rooms' | 'beds' | 'bookings') => {
    set({ adminTab: tab });
  },
  
  // 设置旅客性别，自动更新拼房偏好
  setGuestGender: (gender: Gender) => {
    const newPreference: GenderPreference = gender === 'male' ? 'male_only' : 'female_only';
    set({ guestGender: gender, genderPreference: newPreference });
  },
  
  // 设置拼房偏好
  setGenderPreference: (preference: GenderPreference) => {
    set({ genderPreference: preference });
  },
  
  // 校验性别与房型是否匹配
  validateGenderRoomMatch: (gender: Gender, roomType: RoomType) => {
    if (roomType === 'private' || roomType === 'dorm_mixed') {
      return { valid: true, message: '' };
    }
    if (roomType === 'dorm_male' && gender === 'female') {
      return { valid: false, message: '女生不能预订男生间，请选择女生间或混住间' };
    }
    if (roomType === 'dorm_female' && gender === 'male') {
      return { valid: false, message: '男生不能预订女生间，请选择男生间或混住间' };
    }
    return { valid: true, message: '' };
  },
  
  // 创建预订
  createBooking: (formData: BookingFormData) => {
    const { selectedBeds, rooms, beds, bookings, checkInDate, checkOutDate, validateGenderRoomMatch } = get();
    
    if (selectedBeds.length === 0) {
      return { success: false, message: '请先选择床位' };
    }
    
    // 校验每个床位对应的房间性别匹配
    for (const bedId of selectedBeds) {
      const bed = beds.find(b => b.id === bedId);
      if (!bed || bed.status !== 'available') {
        return { success: false, message: '所选床位不可用，请重新选择' };
      }
      const room = rooms.find(r => r.id === bed.roomId);
      if (!room) {
        return { success: false, message: '房间信息错误' };
      }
      const validation = validateGenderRoomMatch(formData.gender, room.type);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }
    }
    
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
    
    return { success: true, message: '预订成功！' };
  },
  
  // 更新预订信息
  updateBooking: (bookingId: string, updates: Partial<Booking>) => {
    const { bookings } = get();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return { success: false, message: '预订记录不存在' };
    }
    
    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = { ...updatedBookings[bookingIndex], ...updates };
    
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
    
    return { success: true, message: '更新成功' };
  },
  
  // 删除预订（彻底删除记录并释放床位）
  deleteBooking: (bookingId: string) => {
    const { bookings, beds } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    
    // 如果预订是活跃状态（确认或已入住），释放床位
    let updatedBeds = beds;
    if (booking.status === 'confirmed' || booking.status === 'checked_in') {
      updatedBeds = beds.map(b => 
        b.id === booking.bedId ? { ...b, status: 'available' as BedStatus } : b
      );
      set({ beds: updatedBeds });
      saveBeds(updatedBeds);
    }
    
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
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
  
  // ========== 添加房间 ==========
  addRoom: (roomData: Omit<Room, 'id'>) => {
    const { rooms } = get();
    
    const newRoom: Room = {
      id: generateId(),
      ...roomData,
    };
    
    // 生成房间的床位
    const newBeds = generateBedsForRooms([newRoom]);
    
    const updatedRooms = [...rooms, newRoom];
    const updatedBeds = [...get().beds, ...newBeds];
    
    set({ rooms: updatedRooms, beds: updatedBeds });
    saveRooms(updatedRooms);
    saveBeds(updatedBeds);
    
    return { success: true, message: '房间添加成功' };
  },
  
  // ========== 更新房间 ==========
  updateRoom: (roomId: string, updates: Partial<Room>) => {
    const { rooms } = get();
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      return { success: false, message: '房间不存在' };
    }
    
    // 如果修改了容量，需要调整床位数量
    const oldRoom = rooms[roomIndex];
    let updatedBeds = get().beds;
    
    if (updates.capacity !== undefined && updates.capacity !== oldRoom.capacity) {
      // 删除该房间原有的床位
      const roomBeds = updatedBeds.filter(b => b.roomId === roomId);
      
      // 如果新容量更小，删除多余的床位（先检查是否有已预订的）
      if (updates.capacity < oldRoom.capacity) {
        const bedsToKeep = roomBeds.slice(0, updates.capacity);
        const bedsToRemove = roomBeds.slice(updates.capacity);
        
        // 检查要删除的床位是否有已预订的
        const hasBookedBeds = bedsToRemove.some(b => b.status === 'booked');
        if (hasBookedBeds) {
          return { success: false, message: '无法减少床位：有已预订的床位存在' };
        }
        
        updatedBeds = updatedBeds.filter(b => !bedsToRemove.find(r => r.id === b.id));
      } else {
        // 添加新床位
        const bedsToAdd: Bed[] = [];
        for (let i = roomBeds.length; i < updates.capacity; i++) {
          const position = i % 2 === 0 ? 'lower' : 'upper';
          const bedNumber = `${Math.floor(i / 2) + 1}号${position === 'upper' ? '上铺' : '下铺'}`;
          bedsToAdd.push({
            id: generateId(),
            roomId,
            bedNumber,
            position: position as BedPosition,
            status: 'available',
          });
        }
        updatedBeds = [...updatedBeds, ...bedsToAdd];
      }
    }
    
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], ...updates };
    
    set({ rooms: updatedRooms, beds: updatedBeds });
    saveRooms(updatedRooms);
    saveBeds(updatedBeds);
    
    return { success: true, message: '房间更新成功' };
  },
  
  // ========== 删除房间 ==========
  deleteRoom: (roomId: string) => {
    const { rooms, beds, bookings } = get();
    const roomBeds = beds.filter(b => b.roomId === roomId);
    const bedIds = roomBeds.map(b => b.id);
    
    // 检查是否有活跃预订
    const activeBookings = bookings.filter(b => 
      bedIds.includes(b.bedId) && (b.status === 'confirmed' || b.status === 'checked_in')
    );
    
    if (activeBookings.length > 0) {
      return { success: false, message: '无法删除房间：该房间有活跃预订' };
    }
    
    // 删除房间和床位
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    const updatedBeds = beds.filter(b => b.roomId !== roomId);
    // 同时删除相关预订记录
    const updatedBookings = bookings.filter(b => !bedIds.includes(b.bedId));
    
    set({ rooms: updatedRooms, beds: updatedBeds, bookings: updatedBookings });
    saveRooms(updatedRooms);
    saveBeds(updatedBeds);
    saveBookings(updatedBookings);
    
    return { success: true, message: '房间删除成功' };
  },
  
  // ========== 添加床位 ==========
  addBed: (roomId: string, position: BedPosition) => {
    const { beds, rooms } = get();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      return { success: false, message: '房间不存在' };
    }
    
    const roomBeds = beds.filter(b => b.roomId === roomId);
    
    if (roomBeds.length >= room.capacity) {
      return { success: false, message: '该房间已达到最大容量' };
    }
    
    const newBedIndex = roomBeds.length + 1;
    const bedNumber = `${Math.floor((newBedIndex - 1) / 2) + 1}号${position === 'upper' ? '上铺' : '下铺'}`;
    
    const newBed: Bed = {
      id: generateId(),
      roomId,
      bedNumber,
      position,
      status: 'available',
    };
    
    // 更新房间容量
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], capacity: updatedRooms[roomIndex].capacity + 1 };
    
    const updatedBeds = [...beds, newBed];
    
    set({ rooms: updatedRooms, beds: updatedBeds });
    saveRooms(updatedRooms);
    saveBeds(updatedBeds);
    
    return { success: true, message: '床位添加成功' };
  },
  
  // ========== 更新床位 ==========
  updateBed: (bedId: string, updates: Partial<Bed>) => {
    const { beds } = get();
    const bedIndex = beds.findIndex(b => b.id === bedId);
    
    if (bedIndex === -1) {
      return { success: false, message: '床位不存在' };
    }
    
    // 不允许直接修改为booked状态（通过预订流程处理）
    if (updates.status === 'booked') {
      return { success: false, message: '不能直接设置为已预订状态' };
    }
    
    const updatedBeds = [...beds];
    updatedBeds[bedIndex] = { ...updatedBeds[bedIndex], ...updates };
    
    set({ beds: updatedBeds });
    saveBeds(updatedBeds);
    
    return { success: true, message: '床位更新成功' };
  },
  
  // ========== 删除床位 ==========
  deleteBed: (bedId: string) => {
    const { beds, bookings, rooms } = get();
    const bed = beds.find(b => b.id === bedId);
    
    if (!bed) {
      return { success: false, message: '床位不存在' };
    }
    
    if (bed.status === 'booked') {
      return { success: false, message: '无法删除：该床位已被预订' };
    }
    
    const room = rooms.find(r => r.id === bed.roomId);
    if (!room || room.capacity <= 1) {
      return { success: false, message: '房间至少需要保留1个床位' };
    }
    
    // 删除床位，更新房间容量
    const updatedBeds = beds.filter(b => b.id !== bedId);
    const roomIndex = rooms.findIndex(r => r.id === bed.roomId);
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], capacity: updatedRooms[roomIndex].capacity - 1 };
    
    set({ beds: updatedBeds, rooms: updatedRooms });
    saveBeds(updatedBeds);
    saveRooms(updatedRooms);
    
    return { success: true, message: '床位删除成功' };
  },
  
  // ========== 切换床位维护状态 ==========
  toggleBedMaintenance: (bedId: string) => {
    const { beds } = get();
    const bed = beds.find(b => b.id === bedId);
    
    if (!bed) return;
    
    if (bed.status === 'booked') return; // 已预订的不能设为维护
    
    const newStatus: BedStatus = bed.status === 'maintenance' ? 'available' : 'maintenance';
    const updatedBeds = beds.map(b => 
      b.id === bedId ? { ...b, status: newStatus } : b
    );
    
    set({ beds: updatedBeds });
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
      adminTab: 'dashboard',
    });
    saveRooms(initialData.rooms);
    saveBeds(initialData.beds);
    saveBookings(initialData.bookings);
  },
}));
