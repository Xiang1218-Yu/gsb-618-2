import BedItem from './BedItem';
import type { Bed, Booking, Room } from '@/types';
import { useStore } from '@/store/useStore';

interface BedGridProps {
  room: Room;
  beds: Bed[];
  selectedBedId: string | null;
  onSelectBed: (bedId: string) => void;
}

/**
 * 床位网格组件 - 以俯视图形式展示房间内床位布局
 * 根据房间容量自动决定网格列数
 */
export default function BedGrid({ room, beds, selectedBedId, onSelectBed }: BedGridProps) {
  const { selectedDate, getBedBooking, genderFilter } = useStore();

  // 根据容量决定网格列数
  const getGridCols = () => {
    if (room.type === 'private') return 'grid-cols-1';
    if (room.capacity <= 4) return 'grid-cols-2';
    if (room.capacity <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // 获取房型标签
  const getRoomTypeLabel = () => {
    switch (room.type) {
      case 'dorm_4': return '4人宿舍';
      case 'dorm_6': return '6人宿舍';
      case 'dorm_8': return '8人宿舍';
      case 'private': return '大床房';
    }
  };

  // 获取性别政策标签
  const getGenderLabel = () => {
    switch (room.genderPolicy) {
      case 'male_only': return { text: '男生房', color: 'bg-sky-100 text-sky-700' };
      case 'female_only': return { text: '女生房', color: 'bg-pink-100 text-pink-700' };
      case 'mixed': return { text: '混住房', color: 'bg-violet-100 text-violet-700' };
    }
  };

  const genderLabel = getGenderLabel();

  // 获取房间当前性别构成信息
  const { getRoomGenderInfo } = useStore();
  const genderInfo = getRoomGenderInfo(room.id, selectedDate);

  // 判断床位是否可被当前筛选条件选中
  const isBedSelectable = (bed: Bed): boolean => {
    const booking = getBedBooking(bed.id, selectedDate);
    if (booking) return false; // 已被预订

    // 根据性别筛选判断
    if (genderFilter === 'all') return true;
    if (room.genderPolicy === 'male_only' && genderFilter !== 'male') return false;
    if (room.genderPolicy === 'female_only' && genderFilter !== 'female') return false;
    // 混住房根据已有住客性别判断
    if (room.genderPolicy === 'mixed') {
      if (genderFilter === 'female' && genderInfo.males > 0) return false;
      if (genderFilter === 'male' && genderInfo.females > 0) return false;
    }
    return true;
  };

  // 统计可用床位
  const availableCount = beds.filter((b) => isBedSelectable(b) && !getBedBooking(b.id, selectedDate)).length;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A3C40]/5 hover:shadow-md transition-shadow">
      {/* 房间头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            {room.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genderLabel.color}`}>
              {genderLabel.text}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A3C40]/5 text-[#1A3C40]/70 font-medium">
              {getRoomTypeLabel()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#E86A33]">
            ¥{room.pricePerNight}
            <span className="text-xs font-normal text-[#1A3C40]/40 ml-1">/床晚</span>
          </div>
          <div className="text-xs text-[#1A3C40]/50 mt-0.5">
            剩余 <span className="font-bold text-emerald-600">{availableCount}</span> / {room.capacity} 床
          </div>
        </div>
      </div>

      {/* 拼房提示 */}
      {room.type !== 'private' && genderInfo.total > 0 && (
        <div className="mb-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200/50 text-xs text-amber-700">
          {genderInfo.males > 0 && genderInfo.females > 0
            ? `当前已有 ${genderInfo.males} 位男生、${genderInfo.females} 位女生预订此房间`
            : genderInfo.males > 0
            ? `当前已有 ${genderInfo.males} 位男生预订此房间`
            : `当前已有 ${genderInfo.females} 位女生预订此房间`}
        </div>
      )}

      {/* 床位布局 - 房间俯视示意图 */}
      <div className="bg-[#FAF6F0] rounded-xl p-4 border-2 border-dashed border-[#1A3C40]/10 relative">
        {/* 房间入口标记 */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1A3C40]/10 text-[#1A3C40]/50 text-[10px] px-3 py-0.5 rounded-full font-medium">
          房间入口
        </div>

        <div className={`grid ${getGridCols()} gap-3 justify-items-center pt-2`}>
          {beds.map((bed) => {
            const booking = getBedBooking(bed.id, selectedDate);
            const isSelectable = isBedSelectable(bed);
            return (
              <BedItem
                key={bed.id}
                bed={bed}
                booking={booking}
                isSelected={selectedBedId === bed.id}
                isSelectable={isSelectable}
                onClick={() => onSelectBed(bed.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
