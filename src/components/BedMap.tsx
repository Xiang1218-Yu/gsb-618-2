import { ArrowUp, ArrowDown, Check, Users, UserRound, Venus, Mars, BadgeCheck } from 'lucide-react';
import type { Room, Bed, Booking } from '../types';
import { getBookedBedIds, getRoommates, getGenderStats } from '../utils/roomMatcher';

/**
 * 床位平面图组件 - 可视化展示房间床位布局，支持多选
 */

interface BedMapProps {
  room: Room;
  beds: Bed[];
  bookings: Booking[];
  checkIn: string;
  checkOut: string;
  selectedBedIds: string[];
  guestCount: number;
  onToggleBed: (bedId: string) => void;
  onBook: () => void;
}

export default function BedMap({
  room,
  beds,
  bookings,
  checkIn,
  checkOut,
  selectedBedIds,
  guestCount,
  onToggleBed,
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
    if (selectedBedIds.includes(bed.id)) return 'selected';
    return 'available';
  };

  // 选中顺序序号
  const getSelectedOrder = (bedId: string): number => {
    return selectedBedIds.indexOf(bedId) + 1;
  };

  const canSelectMore = selectedBedIds.length < guestCount;
  const allSelected = selectedBedIds.length === guestCount;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{room.name}</h3>
          <p className="text-sm text-gray-500">选择您想要的床位（请选{guestCount}个）</p>
        </div>

        {/* 选择进度和拼房信息 */}
        <div className="flex flex-wrap gap-3">
          {/* 选择进度 */}
          <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
            allSelected ? 'bg-green-100 text-green-700' : 'bg-teal-50 text-teal-700'
          }`}>
            已选 <span className="font-bold">{selectedBedIds.length}</span>/{guestCount} 个床位
          </div>

          {/* 拼房信息提示 */}
          {roommates.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-0.5">
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
          <div className="w-6 h-6 rounded bg-orange-400 border-2 border-orange-500 relative">
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">1</span>
          </div>
          <span>已选</span>
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
                  selectedOrder={getSelectedOrder(pair.upper.id)}
                  canSelect={canSelectMore || selectedBedIds.includes(pair.upper.id)}
                  onClick={() => onToggleBed(pair.upper!.id)}
                  position="upper"
                />
              )}
              {/* 下铺 */}
              {pair.lower && (
                <BedItem
                  bed={pair.lower}
                  state={getBedState(pair.lower)}
                  booking={getBookingForBed(pair.lower.id)}
                  selectedOrder={getSelectedOrder(pair.lower.id)}
                  canSelect={canSelectMore || selectedBedIds.includes(pair.lower.id)}
                  onClick={() => onToggleBed(pair.lower!.id)}
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
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-gray-500">
          {allSelected ? (
            <span className="text-green-600 flex items-center gap-1">
              <BadgeCheck className="w-4 h-4" />
              床位已选满，可继续预订
            </span>
          ) : (
            `还需选择 ${guestCount - selectedBedIds.length} 个床位`
          )}
        </p>
        <button
          onClick={onBook}
          disabled={!allSelected}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 ${
            allSelected
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {allSelected ? `立即预订 ${guestCount} 个床位` : `请选择床位`}
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
  selectedOrder: number;
  canSelect: boolean;
  onClick: () => void;
  position: 'upper' | 'lower';
}

function BedItem({ bed, state, booking, selectedOrder, canSelect, onClick, position }: BedItemProps) {
  const isDisabled = state === 'booked' || (!canSelect && state !== 'selected');

  const stateStyles = {
    available: canSelect
      ? 'bg-green-100 border-green-300 hover:border-green-500 hover:bg-green-200 cursor-pointer'
      : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed',
    booked: 'bg-red-100 border-red-300 cursor-not-allowed opacity-80',
    selected: 'bg-orange-400 border-orange-500 ring-4 ring-orange-200 scale-105 shadow-lg cursor-pointer',
  };

  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      className={`relative rounded-xl border-2 p-3 transition-all duration-200 ${stateStyles[state]}`}
    >
      {/* 选中序号标记 */}
      {state === 'selected' && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md z-10">
          {selectedOrder}
        </div>
      )}

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
        ) : canSelect ? (
          <span className="text-green-700 text-sm font-medium">点击选择</span>
        ) : (
          <span className="text-gray-400 text-sm">已满</span>
        )}
      </div>
    </div>
  );
}
