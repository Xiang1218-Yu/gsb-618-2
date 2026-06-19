import { useStore } from '@/store/useStore';
import { Users } from 'lucide-react';
import type { Bed, Room } from '@/types';

/**
 * 房间状态看板 - 管理端展示每个房间的实时入住情况
 */
export default function RoomStatusBoard() {
  const { rooms, beds, selectedDate, getBedBooking, getAvailableBeds, getRoomGenderInfo } = useStore();

  const bedsByRoom = beds.reduce<Record<string, Bed[]>>((acc, b) => {
    if (!acc[b.roomId]) acc[b.roomId] = [];
    acc[b.roomId].push(b);
    return acc;
  }, {});

  /**
   * 获取床位颜色（用于状态看板）
   */
  const getBedColor = (bed: Bed, room: Room) => {
    const booking = getBedBooking(bed.id, selectedDate);
    if (!booking) return 'bg-emerald-400';
    if (booking.status === 'checked_in') {
      return booking.guestGender === 'female' ? 'bg-pink-500' : 'bg-sky-500';
    }
    return booking.guestGender === 'female' ? 'bg-pink-300' : 'bg-sky-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A3C40]/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          房间实时状态
        </h3>
        <div className="flex items-center gap-3 text-xs text-[#1A3C40]/50">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-400" /> 空闲
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-pink-300" /> 女生预订
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-sky-300" /> 男生预订
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-pink-500" /> 女生入住
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-sky-500" /> 男生入住
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomBeds = bedsByRoom[room.id] || [];
          const available = getAvailableBeds(room.id, selectedDate).length;
          const genderInfo = getRoomGenderInfo(room.id, selectedDate);
          const occupancyRate = Math.round(((room.capacity - available) / room.capacity) * 100);

          return (
            <div
              key={room.id}
              className="border border-[#1A3C40]/10 rounded-xl p-4 hover:border-[#E86A33]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-[#1A3C40] text-sm">{room.name}</h4>
                  <p className="text-xs text-[#1A3C40]/50 mt-0.5">
                    {room.type === 'private' ? '大床房' : `${room.capacity}人${room.genderPolicy === 'mixed' ? '混住' : room.genderPolicy === 'male_only' ? '男生' : '女生'}房`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#E86A33]">¥{room.pricePerNight}</span>
                  <p className="text-xs text-[#1A3C40]/40">/床晚</p>
                </div>
              </div>

              {/* 入住进度条 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#1A3C40]/50 mb-1">
                  <span>入住率 {occupancyRate}%</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.capacity - available}/{room.capacity}
                  </span>
                </div>
                <div className="h-2 bg-[#1A3C40]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E86A33] to-[#d45a28] transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* 床位小图标 */}
              <div className="flex flex-wrap gap-1.5">
                {roomBeds.map((bed) => (
                  <div
                    key={bed.id}
                    className={`w-7 h-7 rounded-lg ${getBedColor(bed, room)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
                    title={`${bed.bedNumber}号床`}
                  >
                    {bed.bedNumber}
                  </div>
                ))}
              </div>

              {/* 性别统计 */}
              {room.type !== 'private' && (genderInfo.males > 0 || genderInfo.females > 0) && (
                <div className="mt-3 pt-2 border-t border-[#1A3C40]/5 flex gap-3 text-xs">
                  {genderInfo.males > 0 && (
                    <span className="text-sky-600">♂ {genderInfo.males}位男生</span>
                  )}
                  {genderInfo.females > 0 && (
                    <span className="text-pink-600">♀ {genderInfo.females}位女生</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
