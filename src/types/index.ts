// 房间性别限制类型：女生专属/男生专属/混住
export type GenderRestriction = 'female-only' | 'male-only' | 'mixed';

// 预订订单状态：已确认/已取消/已入住/已退房
export type BookingStatus = 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out';

// 住客性别：女/男
export type Gender = 'female' | 'male';

// 铺位类型：上铺/下铺
export type BedType = 'upper' | 'lower';

// 房间信息接口
export interface Room {
  id: string;
  name: string;           // 房间名称
  capacity: number;       // 总床位数
  pricePerNight: number;  // 每晚价格
  genderRestriction: GenderRestriction; // 性别限制
  description?: string;   // 房间描述
}

// 床位信息接口
export interface Bed {
  id: string;
  roomId: string;         // 所属房间ID
  bedNumber: number;      // 床位编号
  bedType: BedType;       // 铺位类型
}

// 预订订单接口
export interface Booking {
  id: string;
  roomId: string;         // 预订房间ID
  bedId: string;          // 预订床位ID
  guestName: string;      // 住客姓名
  guestGender: Gender;    // 住客性别
  phone: string;          // 联系电话
  checkInDate: string;    // 入住日期 YYYY-MM-DD
  checkOutDate: string;   // 离店日期 YYYY-MM-DD
  totalPrice: number;     // 总价
  status: BookingStatus;  // 订单状态
  notes?: string;         // 特殊要求备注
  createdAt: string;      // 创建时间
}

// 性别筛选选项（预订者视角的偏好）
export type GenderFilter = 'all' | 'female-only' | 'male-only' | 'mixed';
