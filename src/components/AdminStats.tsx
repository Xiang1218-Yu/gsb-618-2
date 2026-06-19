import { useStore } from '@/store/useStore';
import { Building2, UserCheck, UserX, BedDouble } from 'lucide-react';

/**
 * 管理端统计卡片组件 - 展示今日核心数据
 */
export default function AdminStats() {
  const stats = useStore((s) => s.getTodayStats());
  const occupancyRate = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  const cards = [
    {
      label: '总房间数',
      value: stats.totalRooms,
      icon: Building2,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      label: '今日入住',
      value: stats.todayCheckIn,
      icon: UserCheck,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: '今日退房',
      value: stats.todayCheckOut,
      icon: UserX,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: '入住率',
      value: `${occupancyRate}%`,
      sub: `${stats.occupiedBeds}/${stats.totalBeds}床`,
      icon: BedDouble,
      color: 'from-[#E86A33] to-[#d45a28]',
      bgColor: 'bg-orange-50',
      textColor: 'text-[#E86A33]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A3C40]/5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#1A3C40]/50 font-medium mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-[#1A3C40]/40 mt-0.5">{card.sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
