import { ArrowLeft } from 'lucide-react';
import type { Room, Bed, Booking } from '../types';
import BedItem from './BedItem';
import { useBookingStore } from '../store/useBookingStore';

interface BedLayoutProps {
  room: Room;
  beds: Bed[];
  bookings: Booking[];
  recommendedBeds: string[];
  onBack: () => void;
}

// 床位布局组件：展示房间内的上下铺可视化布局
export default function BedLayout({ room, beds, bookings, recommendedBeds, onBack }: BedLayoutProps) {
  const { selectedBeds, toggleBedSelection } = useBookingStore();
  
  // 按上下铺分组
  const upperBeds = beds.filter(b => b.position === 'upper');
  const lowerBeds = beds.filter(b => b.position === 'lower');

  // 获取床位对应的预订信息
  const getBookingForBed = (bedId: string) => {
    return bookings.find(b => b.bedId === bedId && b.status === 'confirmed');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">返回房间列表</span>
          </button>
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              {room.name}
            </h3>
            <p className="text-sm text-gray-500">点击床位进行选择</p>
          </div>
        </div>
        
        {/* 图例 */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-100 border-2 border-dashed border-gray-200"></div>
            <span>可选</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-green-500"></div>
            <span>推荐</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-orange-500"></div>
            <span>已选</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-200"></div>
            <span>男生</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-pink-200"></div>
            <span>女生</span>
          </div>
        </div>
      </div>

      {/* 床位平面图 */}
      <div className="p-6 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-2xl mx-auto">
          {/* 房间墙顶部 */}
          <div className="h-3 bg-gradient-to-b from-amber-200/60 to-transparent rounded-t-3xl"></div>
          
          {/* 房间主体 */}
          <div className="bg-gradient-to-br from-stone-100 to-amber-50 rounded-b-2xl p-6 border-2 border-amber-100 shadow-inner">
            {/* 上铺区域 */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="w-1 h-6 bg-amber-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-600">上铺</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {upperBeds.map(bed => (
                  <BedItem
                    key={bed.id}
                    bed={bed}
                    booking={getBookingForBed(bed.id)}
                    isSelected={selectedBeds.includes(bed.id)}
                    isRecommended={recommendedBeds.includes(bed.id)}
                    onClick={() => toggleBedSelection(bed.id)}
                  />
                ))}
              </div>
            </div>

            {/* 分隔线 - 代表房间中间空间 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-amber-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-stone-100 to-amber-50 px-3 text-xs text-amber-500">
                  — 过道 —
                </span>
              </div>
            </div>

            {/* 下铺区域 */}
            <div>
              <div className="flex items-center mb-2">
                <div className="w-1 h-6 bg-amber-600 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-600">下铺</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {lowerBeds.map(bed => (
                  <BedItem
                    key={bed.id}
                    bed={bed}
                    booking={getBookingForBed(bed.id)}
                    isSelected={selectedBeds.includes(bed.id)}
                    isRecommended={recommendedBeds.includes(bed.id)}
                    onClick={() => toggleBedSelection(bed.id)}
                  />
                ))}
              </div>
            </div>

            {/* 门和窗户标识 */}
            <div className="flex justify-between mt-6 text-xs text-gray-400">
              <div className="flex items-center">
                <div className="w-8 h-1 bg-amber-700 rounded mr-1"></div>
                <span>门</span>
              </div>
              <div className="flex items-center">
                <span>窗</span>
                <div className="w-10 h-1 bg-sky-300 rounded ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
