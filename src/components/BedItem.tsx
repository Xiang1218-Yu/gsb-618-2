import { ArrowUp, ArrowDown, User } from 'lucide-react';
import type { Bed, Booking } from '../types';

interface BedItemProps {
  bed: Bed;
  booking?: Booking;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}

// 单个床位组件：显示床位状态、入住人信息
export default function BedItem({ bed, booking, isSelected, isRecommended, onClick }: BedItemProps) {
  const isAvailable = bed.status === 'available';
  const isBooked = bed.status === 'booked';
  const isUpper = bed.position === 'upper';

  // 根据状态确定床位的样式
  const getBedStyle = () => {
    if (isSelected) {
      return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200 scale-105 ring-2 ring-amber-300';
    }
    if (isRecommended && isAvailable) {
      return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-green-200 ring-2 ring-green-300 animate-pulse';
    }
    if (isBooked) {
      return booking?.gender === 'male' 
        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 cursor-not-allowed'
        : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700 cursor-not-allowed';
    }
    return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-amber-50 hover:to-amber-100 hover:shadow-md cursor-pointer border-2 border-dashed border-gray-200 hover:border-amber-300';
  };

  return (
    <div
      onClick={isAvailable ? onClick : undefined}
      className={`relative rounded-xl p-3 transition-all duration-300 ${getBedStyle()} ${isUpper ? 'mb-1' : 'mt-1'}`}
    >
      {/* 推荐标签 */}
      {isRecommended && isAvailable && !isSelected && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
          推荐
        </div>
      )}
      
      {/* 选中标签 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
          已选
        </div>
      )}

      {/* 铺位类型标签 */}
      <div className={`absolute top-1 ${isUpper ? 'right-1' : 'left-1'}`}>
        {isUpper ? (
          <ArrowUp className="w-4 h-4 opacity-60" />
        ) : (
          <ArrowDown className="w-4 h-4 opacity-60" />
        )}
      </div>

      {/* 床位信息 */}
      <div className="text-center mt-2">
        <div className="text-xs opacity-70">{isUpper ? '上铺' : '下铺'}</div>
        <div className="font-bold text-sm">{bed.bedNumber.replace(/号(上铺|下铺)/, '')}</div>
        
        {/* 已预订显示入住人信息 */}
        {isBooked && booking && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-center">
              <User className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium truncate max-w-[60px]">{booking.guestName}</span>
            </div>
            <span className="text-xs opacity-70">
              {booking.gender === 'male' ? '♂' : '♀'}
            </span>
          </div>
        )}
        
        {/* 可用状态显示提示 */}
        {isAvailable && (
          <div className="mt-1 text-xs opacity-60">
            {isRecommended ? '✨ 推荐' : isSelected ? '✓ 已选' : '点击选择'}
          </div>
        )}
      </div>
    </div>
  );
}
