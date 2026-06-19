import { useState } from 'react';
import { Search, CheckCircle, XCircle, LogOut, Phone, Calendar as CalendarIcon, BadgeCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Booking, BookingStatus } from '@/types';
import { formatDate } from '@/utils/storage';

/**
 * 获取预订状态标签样式
 */
function getStatusStyle(status: BookingStatus) {
  switch (status) {
    case 'checked_in':
      return { text: '已入住', color: 'bg-emerald-100 text-emerald-700', icon: BadgeCheck };
    case 'pending':
      return { text: '待入住', color: 'bg-amber-100 text-amber-700', icon: CalendarIcon };
    case 'cancelled':
      return { text: '已取消', color: 'bg-slate-100 text-slate-500', icon: XCircle };
  }
}

/**
 * 入住名单表格组件 - 管理端显示所有预订记录
 */
export default function BookingTable() {
  const { bookings, rooms, beds, checkIn, cancelBooking, checkOut } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  // 获取房间名和床号
  const getRoomAndBed = (roomId: string, bedId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    const bed = beds.find((b) => b.id === bedId);
    return { roomName: room?.name || '-', bedNumber: bed?.bedNumber || '-' };
  };

  // 过滤并排序（最新的在前）
  const filteredBookings = bookings
    .filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          b.guestName.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          getRoomAndBed(b.roomId, b.bedId).roomName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A3C40]/5 overflow-hidden">
      {/* 标题栏 */}
      <div className="p-5 border-b border-[#1A3C40]/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            入住名单
          </h3>
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名/电话/房间"
                className="pl-9 pr-4 py-2 rounded-lg border border-[#1A3C40]/10 text-sm focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none w-48"
              />
            </div>
            {/* 状态筛选 */}
            <div className="flex gap-1 bg-[#1A3C40]/5 rounded-lg p-1">
              {[
                { key: 'all' as const, label: '全部' },
                { key: 'pending' as const, label: '待入住' },
                { key: 'checked_in' as const, label: '已入住' },
                { key: 'cancelled' as const, label: '已取消' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filter === f.key
                      ? 'bg-white text-[#E86A33] shadow-sm'
                      : 'text-[#1A3C40]/50 hover:text-[#1A3C40]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF6F0] text-[#1A3C40]/60 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-medium">住客</th>
              <th className="px-5 py-3 text-left font-medium">房间/床位</th>
              <th className="px-5 py-3 text-left font-medium">入住-退房</th>
              <th className="px-5 py-3 text-left font-medium">联系电话</th>
              <th className="px-5 py-3 text-left font-medium">状态</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A3C40]/5">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#1A3C40]/40">
                  暂无预订记录
                </td>
              </tr>
            ) : (
              filteredBookings.map((b: Booking) => {
                const { roomName, bedNumber } = getRoomAndBed(b.roomId, b.bedId);
                const st = getStatusStyle(b.status);
                const genderLabel = b.guestGender === 'male' ? '♂' : '♀';
                const genderColor = b.guestGender === 'male' ? 'text-sky-500' : 'text-pink-500';
                return (
                  <tr key={b.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${genderColor}`}>{genderLabel}</span>
                        <span className="font-medium text-[#1A3C40]">{b.guestName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1A3C40]/70">
                      {roomName} · {bedNumber}号床
                    </td>
                    <td className="px-5 py-4 text-[#1A3C40]/70 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>{formatDate(b.checkInDate)}</span>
                        <span className="text-[#1A3C40]/30">→</span>
                        <span>{formatDate(b.checkOutDate)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${b.phone}`}
                        className="flex items-center gap-1 text-[#1A3C40]/70 hover:text-[#E86A33]"
                      >
                        <Phone className="w-3 h-3" />
                        {b.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}
                      >
                        <st.icon className="w-3 h-3" />
                        {st.text}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => checkIn(b.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              入住
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelBooking(b.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              取消
                            </button>
                          </>
                        )}
                        {b.status === 'checked_in' && (
                          <button
                            type="button"
                            onClick={() => checkOut(b.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                          >
                            <LogOut className="w-3 h-3" />
                            退房
                          </button>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="text-xs text-[#1A3C40]/30">无操作</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
