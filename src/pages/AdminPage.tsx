import { useEffect, useMemo } from 'react';
import { Building2, Users, Calendar, X, UserRound, Venus, Mars, Bed, Phone, CheckCircle, Clock } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { getTodayString, datesOverlap } from '../utils/date';
import { genderRestrictionText, genderText } from '../utils/roomMatcher';
import Header from '../components/Header';
import type { Room, Booking } from '../types';

/**
 * 管理后台页面 - 入住名单、预订管理、房间总览
 */
export default function AdminPage() {
  const { rooms, beds, bookings, initializeStore, cancelBooking } = useBookingStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const today = getTodayString();

  // 统计数据
  const stats = useMemo(() => {
    // 当前在住订单（今天有入住的）
    const activeBookings = bookings.filter(b =>
      b.status === 'confirmed' &&
      datesOverlap(today, today, b.checkInDate, b.checkOutDate)
    );
    const totalConfirmed = bookings.filter(b => b.status === 'confirmed').length;
    return {
      totalRooms: rooms.length,
      totalBeds: beds.length,
      todayGuests: activeBookings.length,
      totalBookings: totalConfirmed,
    };
  }, [rooms, beds, bookings, today]);

  // 按房间分组当前在住客人
  const guestsByRoom = useMemo(() => {
    const result: Record<string, Booking[]> = {};
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    rooms.forEach(room => {
      const roomBookings = bookings.filter(b =>
        b.status === 'confirmed' &&
        b.roomId === room.id &&
        datesOverlap(today, tomorrowStr, b.checkInDate, b.checkOutDate)
      );
      result[room.id] = roomBookings;
    });
    return result;
  }, [rooms, bookings, today]);

  // 所有有效预订记录
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  // 获取床位号
  const getBedNumber = (bedId: string): number => {
    const bed = beds.find(b => b.id === bedId);
    return bed?.bedNumber || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            label="总房间数"
            value={stats.totalRooms}
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
          <StatCard
            icon={<Bed className="w-6 h-6" />}
            label="总床位数"
            value={stats.totalBeds}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="今日在住"
            value={stats.todayGuests}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="有效预订"
            value={stats.totalBookings}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>

        {/* 今日入住名单 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            实时入住名单（{today}）
          </h2>

          {rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无房间数据</div>
          ) : (
            <div className="space-y-6">
              {rooms.map((room) => (
                <RoomGuestList
                  key={room.id}
                  room={room}
                  guests={guestsByRoom[room.id] || []}
                  getBedNumber={getBedNumber}
                  onCancel={cancelBooking}
                />
              ))}
            </div>
          )}
        </section>

        {/* 所有预订记录 */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            全部预订记录
            <span className="text-sm font-normal text-gray-500">（{confirmedBookings.length}条有效，{cancelledBookings.length}条已取消）</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">住客</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">房间/床位</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">入住日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">离店日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">联系电话</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">金额</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {confirmedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">暂无预订记录</td>
                  </tr>
                ) : (
                  confirmedBookings.map((booking) => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              booking.guestGender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                            }`}>
                              {booking.guestGender === 'female' ? (
                                <Venus className="w-4 h-4 text-pink-600" />
                              ) : (
                                <Mars className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{booking.guestName}</div>
                              <div className="text-xs text-gray-500">{genderText(booking.guestGender)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-700">{room?.name}</div>
                          <div className="text-xs text-gray-500">{getBedNumber(booking.bedId)}号床</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{booking.checkInDate}</td>
                        <td className="py-3 px-4 text-gray-600">{booking.checkOutDate}</td>
                        <td className="py-3 px-4 text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.phone}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-orange-600">¥{booking.totalPrice}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            已确认
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            取消
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="mt-16 py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/50">
        <p>旅途青旅管理后台 · 本地演示版</p>
      </footer>
    </div>
  );
}

// 统计卡片组件
function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

// 房间客人列表组件
function RoomGuestList({
  room,
  guests,
  getBedNumber,
  onCancel,
}: {
  room: Room;
  guests: Booking[];
  getBedNumber: (bedId: string) => number;
  onCancel: (id: string) => void;
}) {
  const occupancyRate = Math.round((guests.length / room.capacity) * 100);

  // 房间性别标签颜色
  const genderBadgeColor = () => {
    if (room.genderRestriction === 'female-only') return 'bg-pink-100 text-pink-700';
    if (room.genderRestriction === 'male-only') return 'bg-blue-100 text-blue-700';
    return 'bg-teal-100 text-teal-700';
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* 房间头部 */}
      <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800">{room.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${genderBadgeColor()}`}>
            {genderRestrictionText(room.genderRestriction)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            <span className="font-bold text-teal-600">{guests.length}</span>/{room.capacity}人入住
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 客人列表 */}
      <div className="p-5">
        {guests.length === 0 ? (
          <div className="text-center py-6 text-gray-400 flex flex-col items-center gap-2">
            <Bed className="w-8 h-8 opacity-30" />
            <span>今日暂无入住客人</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 group hover:shadow-md transition-all"
              >
                {/* 头像 */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  guest.guestGender === 'female'
                    ? 'bg-gradient-to-br from-pink-200 to-pink-300 text-pink-700'
                    : 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-700'
                }`}>
                  <UserRound className="w-6 h-6" />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{guest.guestName}</span>
                    {guest.guestGender === 'female' ? (
                      <Venus className="w-4 h-4 text-pink-500" />
                    ) : (
                      <Mars className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs">
                      {getBedNumber(guest.bedId)}号床
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {guest.checkInDate}
                    </span>
                  </div>
                </div>

                {/* 取消按钮 */}
                <button
                  onClick={() => onCancel(guest.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="取消预订"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
