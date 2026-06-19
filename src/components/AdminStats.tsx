import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Building2, UserCheck, UserX, BedDouble } from 'lucide-react';

/**
 * 判断预订在指定日期是否有效（入住<=日期<退房，且未取消）
 * 逻辑与 store 中一致，在组件内计算以避免 selector 返回新对象导致重渲染循环
 */
function isBookingActiveOnDate(
  booking: { checkInDate: string; checkOutDate: string; status: string },
  dateStr: string
): boolean {
  if (booking.status === 'cancelled') return false;
  return booking.checkInDate <= dateStr && dateStr < booking.checkOutDate;
}

/**
 * 管理端统计卡片组件 - 展示今日核心数据
 */
export default function AdminStats() {
  // 通过 selector 获取原始数据（稳定引用），在组件内 useMemo 计算统计值
  // 不要在 selector 中调用返回新对象的方法（如 getTodayStats()），否则每次渲染返回新对象会导致无限循环
  const rooms = useStore((s) => s.rooms);
  const beds = useStore((s) => s.beds);
  const bookings = useStore((s) => s.bookings);
  const selectedDate = useStore((s) => s.selectedDate);

  const stats = useMemo(() => {
    const today = selectedDate;
    const todayCheckIn = bookings.filter(
      (b) => b.status !== 'cancelled' && b.checkInDate === today
    ).length;
    const todayCheckOut = bookings.filter(
      (b) => b.status !== 'cancelled' && b.checkOutDate === today
    ).length;
    const occupiedBeds = bookings.filter((b) => isBookingActiveOnDate(b, today)).length;
    return {
      totalRooms: rooms.length,
      todayCheckIn,
      todayCheckOut,
      occupiedBeds,
      totalBeds: beds.length,
    };
  }, [rooms, beds, bookings, selectedDate]);

  const occupancyRate = stats.totalBeds > 0
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
    : 0;

  const cards = [
    {
      label: '总房间数',
      value: stats.totalRooms,
      icon: Building2,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      label: '今日入住',
      value: stats.todayCheckIn,
      icon: UserCheck,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: '今日退房',
      value: stats.todayCheckOut,
      icon: UserX,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: '入住率',
      value: `${occupancyRate}%`,
      sub: `${stats.occupiedBeds}/${stats.totalBeds}床`,
      icon: BedDouble,
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
