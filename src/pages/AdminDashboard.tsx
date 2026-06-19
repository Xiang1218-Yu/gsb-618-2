import { useMemo } from 'react';
import { LayoutDashboard, BedDouble, ClipboardList, Wrench, RefreshCw, Users, Percent, CalendarCheck, Home } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import StatCard from '../components/StatCard';
import GuestList from '../components/GuestList';
import RoomManager from '../components/RoomManager';
import BedManager from '../components/BedManager';
import BookingManager from '../components/BookingManager';
import { getTodayString } from '../utils/storage';

type AdminTab = 'dashboard' | 'rooms' | 'beds' | 'bookings';

// 管理后台页面：管理员视图，统计概览、房间/床位/订单管理
export default function AdminDashboard() {
  const { 
    rooms, beds, bookings, adminTab, setAdminTab, resetData,
    selectedBeds, selectedRoomId
  } = useBookingStore();
  const today = getTodayString();

  // 计算统计数据
  const stats = useMemo(() => {
    const todayCheckIns = bookings.filter(
      b => b.checkIn === today && (b.status === 'confirmed' || b.status === 'checked_in')
    ).length;

    const currentGuests = bookings.filter(b => b.status === 'checked_in').length;
    const totalBeds = beds.length;
    const availableBeds = beds.filter(b => b.status === 'available').length;
    const occupancyRate = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;
    const totalBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'checked_out').length;

    return { todayCheckIns, currentGuests, totalBeds, availableBeds, occupancyRate, totalBookings };
  }, [beds, bookings, today]);

  // 各房间状态
  const roomStatuses = useMemo(() => {
    return rooms.map(room => {
      const roomBeds = beds.filter(b => b.roomId === room.id);
      const bookedCount = roomBeds.filter(b => b.status === 'booked').length;
      const availableCount = roomBeds.filter(b => b.status === 'available').length;
      return {
        ...room,
        bookedCount,
        availableCount,
        totalCount: roomBeds.length,
        occupancyRate: roomBeds.length > 0 ? Math.round((bookedCount / roomBeds.length) * 100) : 0,
      };
    });
  }, [rooms, beds]);

  // 今日预订
  const todayBookings = useMemo(() => {
    return bookings.filter(
      b => b.checkIn === today && (b.status === 'confirmed' || b.status === 'checked_in')
    );
  }, [bookings, today]);

  // 当前在住客人
  const currentStays = useMemo(() => {
    return bookings.filter(b => b.status === 'checked_in');
  }, [bookings]);

  // 待确认预订
  const pendingBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'confirmed');
  }, [bookings]);

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？这将恢复到初始示例数据状态。')) {
      resetData();
    }
  };

  // 标签页配置
  const tabs: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'dashboard', label: '概览', icon: LayoutDashboard },
    { key: 'rooms', label: '房间管理', icon: Home },
    { key: 'beds', label: '床位管理', icon: Wrench },
    { key: 'bookings', label: '订单管理', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              📊 管理后台
            </h2>
            <p className="text-gray-500 mt-1">实时查看入住情况，管理房间、床位和订单</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">重置数据</span>
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setAdminTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  adminTab === tab.key
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 概览页面 */}
        {adminTab === 'dashboard' && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
              <StatCard
                title="今日入住"
                value={stats.todayCheckIns}
                icon={CalendarCheck}
                color="green"
                subtitle="今日预计抵达"
              />
              <StatCard
                title="在住客人"
                value={stats.currentGuests}
                icon={Users}
                color="blue"
                subtitle="当前已入住"
              />
              <StatCard
                title="剩余床位"
                value={`${stats.availableBeds}/${stats.totalBeds}`}
                icon={BedDouble}
                color="amber"
                subtitle="可用/总数"
              />
              <StatCard
                title="入住率"
                value={`${stats.occupancyRate}%`}
                icon={Percent}
                color="purple"
                subtitle="当前床位占用"
              />
            </div>

            {/* 房间状态概览 */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-600" />
                房间状态
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {roomStatuses.map(room => (
                  <div key={room.id} className="bg-gray-50 rounded-xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 text-sm truncate">{room.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        room.occupancyRate >= 80 ? 'bg-red-100 text-red-600' :
                        room.occupancyRate >= 50 ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {room.occupancyRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          room.occupancyRate >= 80 ? 'bg-red-400' :
                          room.occupancyRate >= 50 ? 'bg-amber-400' :
                          'bg-green-400'
                        }`}
                        style={{ width: `${room.occupancyRate}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>已预订: {room.bookedCount}</span>
                      <span>空闲: {room.availableCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 入住名单 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GuestList
                title="📋 今日入住名单"
                bookings={todayBookings}
                rooms={rooms}
                beds={beds}
                pageSize={5}
              />
              <GuestList
                title="🏠 当前在住客人"
                bookings={currentStays}
                rooms={rooms}
                beds={beds}
                filterStatus="checked_in"
                pageSize={5}
              />
            </div>

            {/* 待处理预订 */}
            <div className="mt-6">
              <GuestList
                title="📅 待确认预订"
                bookings={pendingBookings}
                rooms={rooms}
                beds={beds}
                filterStatus="confirmed"
                pageSize={5}
              />
            </div>
          </>
        )}

        {/* 房间管理页面 */}
        {adminTab === 'rooms' && (
          <div className="animate-fade-in">
            <RoomManager />
          </div>
        )}

        {/* 床位管理页面 */}
        {adminTab === 'beds' && (
          <div className="animate-fade-in">
            <BedManager />
          </div>
        )}

        {/* 订单管理页面 */}
        {adminTab === 'bookings' && (
          <div className="animate-fade-in">
            <BookingManager />
          </div>
        )}
      </div>
    </div>
  );
}
