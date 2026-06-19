import { ArrowUp, ArrowDown, Check, Users, UserRound, Venus, Mars } from 'lucide-react';
import type { Room, Bed, Booking } from '../types';
import { getBookedBedIds, getRoommates, getGenderStats, genderText } from '../utils/roomMatcher';

/**
 * 床位平面图组件 - 可视化展示房间床位布局
 */

interface BedMapProps {
  room: Room;
  beds: Bed[];
  bookings: Booking[];
  checkIn: string;
  checkOut: string;
  selectedBedId: string | null;
  onSelectBed: (bedId: string) => void;
  onBook: () => void;
}

export default function BedMap({
  room,
  beds,
  bookings,
  checkIn,
  checkOut,
  selectedBedId,
  onSelectBed,
  onBook,
}: BedMapProps) {
  // 获取该房间已预订床位ID
  const bookedBedIds = getBookedBedIds(bookings, room.id, checkIn, checkOut);
  // 获取同房间拼房住客
  const roommates = getRoommates(bookings, room.id, checkIn, checkOut);
  const genderStats = getGenderStats(roommates);

  // 按床位号排序
  const roomBeds = beds
    .filter(b => b.roomId === room.id)
    .sort((a, b) => a.bedNumber - b.bedNumber);

  // 床位分为两列布局：上铺和下铺配对展示
  const pairs: { upper?: Bed; lower?: Bed }[] = [];
  for (let i = 0; i < roomBeds.length; i += 2) {
    const lower = roomBeds[i];     // 奇数床号是下铺
    const upper = roomBeds[i + 1]; // 偶数床号是上铺
    pairs.push({ lower, upper });
  }

  // 获取床位预订者信息
  const getBookingForBed = (bedId: string): Booking | undefined => {
    return roommates.find(b => b.bedId === bedId);
  };

  // 床位状态：available/booked/selected
  const getBedState = (bed: Bed): 'available' | 'booked' | 'selected' => {
    if (bookedBedIds.has(bed.id)) return 'booked';
    if (selectedBedId === bed.id) return 'selected';
    return 'available';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{room.name}</h3>
          <p className="text-sm text-gray-500">选择您想要的床位</p>
        </div>

        {/* 拼房信息提示 */}
        {roommates.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
              <Users className="w-4 h-4" />
              已有{roommates.length}位住客拼房
            </div>
            <div className="flex gap-3 text-amber-600">
              {genderStats.female > 0 && (
                <span className="flex items-center gap-1">
                  <Venus className="w-3 h-3" />女 {genderStats.female}人
                </span>
              )}
              {genderStats.male > 0 && (
                <span className="flex items-center gap-1">
                  <Mars className="w-3 h-3" />男 {genderStats.male}人
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-200 border-2 border-green-300" />
          <span>可选</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-200 border-2 border-red-300" />
          <span>已订</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-orange-400 border-2 border-orange-500" />
          <span>选中</span>
        </div>
      </div>

      {/* 床位布局区域 */}
      <div className="bg-stone-50 rounded-xl p-6 border-2 border-stone-200">
        {/* 窗户示意 */}
        <div className="w-full h-3 bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 rounded-t-lg mb-6 relative">
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">窗户</span>
        </div>

        <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(pairs.length, 3)}, minmax(0, 1fr))` }}>
          {pairs.map((pair, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              {/* 上铺 */}
              {pair.upper && (
                <BedItem
                  bed={pair.upper}
                  state={getBedState(pair.upper)}
                  booking={getBookingForBed(pair.upper.id)}
                  onClick={() => onSelectBed(pair.upper!.id)}
                  position="upper"
                />
              )}
              {/* 下铺 */}
              {pair.lower && (
                <BedItem
                  bed={pair.lower}
                  state={getBedState(pair.lower)}
                  booking={getBookingForBed(pair.lower.id)}
                  onClick={() => onSelectBed(pair.lower!.id)}
                  position="lower"
                />
              )}
            </div>
          ))}
        </div>

        {/* 房门示意 */}
        <div className="flex justify-center mt-8">
          <div className="w-20 h-2 bg-amber-700 rounded-b-lg relative">
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">房门</span>
          </div>
        </div>
      </div>

      {/* 确认预订按钮 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onBook}
          disabled={!selectedBedId}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 ${
            selectedBedId
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {selectedBedId ? '立即预订此床位' : '请选择一个床位'}
        </button>
      </div>
    </div>
  );
}

// 单个床位组件
interface BedItemProps {
  bed: Bed;
  state: 'available' | 'booked' | 'selected';
  booking?: Booking;
  onClick: () => void;
  position: 'upper' | 'lower';
}

function BedItem({ bed, state, booking, onClick, position }: BedItemProps) {
  const stateStyles = {
    available: 'bg-green-100 border-green-300 hover:border-green-500 hover:bg-green-200 cursor-pointer',
    booked: 'bg-red-100 border-red-300 cursor-not-allowed opacity-80',
    selected: 'bg-orange-400 border-orange-500 ring-4 ring-orange-200 scale-105 shadow-lg',
  };

  return (
    <div
      onClick={state === 'booked' ? undefined : onClick}
      className={`relative rounded-xl border-2 p-3 transition-all duration-200 ${stateStyles[state]}`}
    >
      {/* 铺位标签 */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          state === 'selected' ? 'bg-white/30 text-white' : 'bg-white/60 text-gray-600'
        }`}>
          {position === 'upper' ? (
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" />上铺</span>
          ) : (
            <span className="flex items-center gap-1"><ArrowDown className="w-3 h-3" />下铺</span>
          )}
        </span>
        <span className={`font-bold text-lg ${state === 'selected' ? 'text-white' : 'text-gray-700'}`}>
          {bed.bedNumber}号床
        </span>
      </div>

      {/* 床位图示 */}
      <div className={`h-12 rounded-lg flex items-center justify-center ${
        state === 'selected' ? 'bg-white/20' : state === 'booked' ? 'bg-red-200/50' : 'bg-green-200/50'
      }`}>
        {state === 'booked' ? (
          booking ? (
            <div className="flex flex-col items-center text-xs">
              <div className="flex items-center gap-1 text-red-700 font-medium">
                <UserRound className="w-4 h-4" />
                {booking.guestName}
                {booking.guestGender === 'female' ? (
                  <Venus className="w-3 h-3 text-pink-500" />
                ) : (
                  <Mars className="w-3 h-3 text-blue-500" />
                )}
              </div>
              <span className="text-red-500 text-[10px]">已预订</span>
            </div>
          ) : (
            <Check className="w-5 h-5 text-red-500" />
          )
        ) : state === 'selected' ? (
          <span className="text-white font-bold text-sm">已选中 ✓</span>
        ) : (
          <span className="text-green-700 text-sm font-medium">点击选择</span>
        )}
      </div>
    </div>
  );
}
