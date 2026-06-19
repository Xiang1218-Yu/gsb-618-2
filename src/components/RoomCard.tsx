import { Users, Bed, ChevronRight } from 'lucide-react';
import type { Room, Bed as BedType } from '../types';

// 房间类型映射
const roomTypeLabels: Record<Room['type'], { label: string; emoji: string; color: string }> = {
  dorm_male: { label: '男生间', emoji: '👨', color: 'bg-blue-100 text-blue-700' },
  dorm_female: { label: '女生间', emoji: '👩', color: 'bg-pink-100 text-pink-700' },
  dorm_mixed: { label: '混住间', emoji: '👥', color: 'bg-purple-100 text-purple-700' },
  private: { label: '包间', emoji: '🏡', color: 'bg-amber-100 text-amber-700' },
};

interface RoomCardProps {
  room: Room;
  beds: BedType[];
  isSelected: boolean;
  onSelect: () => void;
}

// 房间卡片组件：展示房间信息和剩余床位
export default function RoomCard({ room, beds, isSelected, onSelect }: RoomCardProps) {
  const availableCount = beds.filter(b => b.status === 'available').length;
  const totalCount = beds.length;
  const occupancyRate = ((totalCount - availableCount) / totalCount) * 100;
  const typeInfo = roomTypeLabels[room.type];

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-amber-500 shadow-amber-200 shadow-lg scale-[1.02]' : ''
      }`}
    >
      {/* 房间顶部装饰 */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
      
      <div className="p-5">
        {/* 房间类型标签 */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
            <span className="mr-1">{typeInfo.emoji}</span>
            {typeInfo.label}
          </span>
          {isSelected && (
            <span className="text-amber-600 text-sm font-medium flex items-center animate-pulse">
              已选择 <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* 房间名称 */}
        <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          {room.name}
        </h3>
        
        {/* 房间描述 */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* 床位信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Bed className="w-4 h-4 mr-1.5" />
            <span>{totalCount}个床位</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-1.5" />
            <span>剩余 <span className={`font-bold ${availableCount > 0 ? 'text-green-600' : 'text-red-500'}`}>{availableCount}</span> 位</span>
          </div>
        </div>

        {/* 入住率进度条 */}
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyRate >= 80 ? 'bg-red-400' : occupancyRate >= 50 ? 'bg-amber-400' : 'bg-green-400'
              }`}
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">入住率</span>
            <span className="text-xs text-gray-500 font-medium">{Math.round(occupancyRate)}%</span>
          </div>
        </div>

        {/* 价格和选择按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-amber-600">¥{room.pricePerBed}</span>
            <span className="text-gray-400 text-sm ml-1">/床/晚</span>
          </div>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              availableCount > 0
                ? isSelected
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={availableCount === 0}
          >
            {availableCount > 0 ? (isSelected ? '选择床位' : '查看床位') : '已满房'}
          </button>
        </div>
      </div>
    </div>
  );
}
