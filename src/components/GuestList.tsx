import { useState, useMemo, useEffect } from 'react';
import { Phone, Calendar, X, CheckCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Room, Bed } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { formatDate } from '../utils/storage';

interface GuestListProps {
  bookings: Booking[];
  rooms: Room[];
  beds: Bed[];
  filterStatus?: Booking['status'];
  title: string;
  pageSize?: number;
}

// 状态标签映射
const statusLabels: Record<Booking['status'], { label: string; color: string }> = {
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
  checked_in: { label: '已入住', color: 'bg-green-100 text-green-700' },
  checked_out: { label: '已退房', color: 'bg-gray-100 text-gray-400' },
};

// 入住名单组件：展示预订记录和入住信息，支持分页
export default function GuestList({ bookings, rooms, beds, filterStatus, title, pageSize = 5 }: GuestListProps) {
  const { cancelBooking, checkIn, checkOut } = useBookingStore();
  const [currentPage, setCurrentPage] = useState(1);

  // 过滤预订记录
  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (filterStatus) {
      result = bookings.filter(b => b.status === filterStatus);
    } else {
      result = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'checked_out');
    }
    // 按入住日期倒序排列
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, filterStatus]);

  // 分页计算
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // 重置页码到第一页当数据变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [bookings]);

  // 获取房间名称
  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || '未知房间';
  };

  // 获取床位号
  const getBedNumber = (bedId: string) => {
    return beds.find(b => b.id === bedId)?.bedNumber || '未知床位';
  };

  // 获取性别图标
  const getGenderIcon = (gender: Booking['gender']) => {
    return gender === 'male' ? '👨' : '👩';
  };

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-400">暂无记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <span className="text-sm text-gray-500">共 {filteredBookings.length} 条记录</span>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {paginatedBookings.map(booking => (
          <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* 客人信息 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getGenderIcon(booking.gender)}</span>
                  <span className="font-bold text-gray-800">{booking.guestName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[booking.status].color}`}>
                    {statusLabels[booking.status].label}
                  </span>
                </div>
                
                {/* 房间床位 */}
                <div className="text-sm text-gray-600 mb-1">
                  🛏️ {getRoomName(booking.roomId)} - {getBedNumber(booking.bedId)}
                </div>
                
                {/* 联系信息 */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {booking.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 ml-3">
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => checkIn(booking.id)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                      title="办理入住"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`确定要取消 ${booking.guestName} 的预订吗？`)) {
                          cancelBooking(booking.id);
                        }
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="取消预订"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {booking.status === 'checked_in' && (
                  <button
                    onClick={() => checkOut(booking.id)}
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    title="办理退房"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-amber-500 text-white'
                    : 'border border-gray-200 hover:bg-white hover:border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
