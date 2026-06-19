import { ChevronRight, Bed, Users, Venus, Mars, Shuffle } from 'lucide-react';
import type { Room, Bed as BedType, Booking } from '../types';
import { getAvailableBedCount, genderRestrictionText } from '../utils/roomMatcher';

/**
 * 房间卡片组件 - 展示房型概要信息
 */

interface RoomCardProps {
  room: Room;
  beds: BedType[];
  bookings: Booking[];
  checkIn: string;
  checkOut: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function RoomCard({
  room,
  beds,
  bookings,
  checkIn,
  checkOut,
  isSelected,
  onSelect,
}: RoomCardProps) {
  const availableCount = getAvailableBedCount(room, beds, bookings, checkIn, checkOut);
  const isFull = availableCount === 0;

  // 性别限制图标
  const GenderIcon = () => {
    if (room.genderRestriction === 'female-only') return <Venus className="w-4 h-4 text-pink-500" />;
    if (room.genderRestriction === 'male-only') return <Mars className="w-4 h-4 text-blue-500" />;
    return <Shuffle className="w-4 h-4 text-teal-600" />;
  };

  // 性别限制颜色标签
  const genderBadgeColor = () => {
    if (room.genderRestriction === 'female-only') return 'bg-pink-100 text-pink-700';
    if (room.genderRestriction === 'male-only') return 'bg-blue-100 text-blue-700';
    return 'bg-teal-100 text-teal-700';
  };

  return (
    <div
      onClick={isFull ? undefined : onSelect}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isFull
          ? 'opacity-60 cursor-not-allowed bg-gray-100'
          : isSelected
          ? 'ring-2 ring-teal-500 ring-offset-2 shadow-xl cursor-pointer scale-[1.02] bg-white'
          : 'shadow-md hover:shadow-xl cursor-pointer bg-white hover:-translate-y-1'
      }`}
    >
      {/* 选中指示条 */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-orange-500" />
      )}

      <div className="p-5">
        {/* 头部：名称和标签 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${genderBadgeColor()}`}>
                <GenderIcon />
                {genderRestrictionText(room.genderRestriction)}
              </span>
            </div>
          </div>

          {/* 价格标签 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">¥{room.pricePerNight}</div>
            <div className="text-xs text-gray-500">/晚/床</div>
          </div>
        </div>

        {/* 描述 */}
        {room.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{room.description}</p>
        )}

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {/* 容量 */}
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {room.capacity}个床位
            </span>
          </div>

          {/* 剩余床位 */}
          <div className="flex items-center gap-2">
            {isFull ? (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                已满房
              </span>
            ) : (
              <>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  剩{availableCount}床
                </span>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'translate-x-1 text-teal-500' : ''}`} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
