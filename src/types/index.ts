// 性别类型：男性/女性
export type Gender = 'male' | 'female';

// 性别偏好类型：仅男生/仅女生/混住均可
export type GenderPreference = 'male_only' | 'female_only' | 'any';

// 房间类型：男生多人间/女生多人间/混住多人间/包间
export type RoomType = 'dorm_male' | 'dorm_female' | 'dorm_mixed' | 'private';

// 床位位置：上铺/下铺
export type BedPosition = 'upper' | 'lower';

// 床位状态：可用/已预订/已选中/维护中
export type BedStatus = 'available' | 'booked' | 'selected' | 'maintenance';

// 预订状态：已确认/已取消/已入住/已退房
export type BookingStatus = 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';

// 房间接口
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  pricePerBed: number;
  description: string;
  isActive: boolean;
}

// 床位接口
export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  position: BedPosition;
  status: BedStatus;
}

// 预订接口
export interface Booking {
  id: string;
  bedId: string;
  roomId: string;
  guestName: string;
  gender: Gender;
  phone: string;
  checkIn: string;
  checkOut: string;
  genderPreference: GenderPreference;
  createdAt: string;
  status: BookingStatus;
}

// 统计数据接口
export interface Statistics {
  todayCheckIns: number;
  totalBookings: number;
  occupancyRate: number;
  availableBeds: number;
  totalBeds: number;
}

// 预订表单数据接口
export interface BookingFormData {
  guestName: string;
  gender: Gender;
  phone: string;
  checkIn: string;
  checkOut: string;
  genderPreference: GenderPreference;
}
