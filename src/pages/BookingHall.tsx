import { useState, useMemo } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import RoomCard from '../components/RoomCard';
import BedLayout from '../components/BedLayout';
import BookingForm from '../components/BookingForm';
import { recommendBeds } from '../utils/matching';
import type { GenderPreference, Gender } from '../types';

// 预订大厅页面：旅客预订主界面
export default function BookingHall() {
  const { rooms, beds, bookings, selectedRoomId, selectRoom, checkInDate, checkOutDate } = useBookingStore();
  const [genderFilter, setGenderFilter] = useState<GenderPreference>('any');
  const [guestGender, setGuestGender] = useState<Gender>('male');

  // 获取选中的房间
  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  // 获取选中房间的床位
  const selectedRoomBeds = useMemo(() => {
    if (!selectedRoomId) return [];
    return beds.filter(b => b.roomId === selectedRoomId);
  }, [beds, selectedRoomId]);

  // 推荐床位
  const recommendedBeds = useMemo(() => {
    if (!selectedRoomId) return [];
    return recommendBeds(
      rooms,
      beds,
      bookings,
      guestGender,
      genderFilter,
      checkInDate,
      checkOutDate,
      2
    ).filter(id => beds.find(b => b.id === id)?.roomId === selectedRoomId);
  }, [rooms, beds, bookings, selectedRoomId, guestGender, genderFilter, checkInDate, checkOutDate]);

  // 过滤房间列表
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (!room.isActive) return false;
      if (genderFilter === 'male_only') {
        return room.type === 'dorm_male' || room.type === 'dorm_mixed' || room.type === 'private';
      }
      if (genderFilter === 'female_only') {
        return room.type === 'dorm_female' || room.type === 'dorm_mixed' || room.type === 'private';
      }
      return true;
    });
  }, [rooms, genderFilter]);

  // 获取房间对应的床位列表
  const getBedsForRoom = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId);
  };

  const handleBack = () => {
    selectRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎横幅 */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            🌿 选择你在旅途中的家
          </h2>
          <p className="text-gray-500">选择心仪的房间，开启一段美好旅程</p>
        </div>

        {/* 筛选栏 */}
        {!selectedRoom && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">我是：</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGuestGender('male')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    guestGender === 'male'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👨 男生
                </button>
                <button
                  onClick={() => setGuestGender('female')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    guestGender === 'female'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👩 女生
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">拼房偏好：</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'female_only', label: '👩 仅女生间' },
                  { value: 'any', label: '👥 都可以' },
                  { value: 'male_only', label: '👨 仅男生间' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGenderFilter(opt.value as GenderPreference)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      genderFilter === opt.value
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：房间/床位选择 */}
          <div className="lg:col-span-2">
            {selectedRoom ? (
              <BedLayout
                room={selectedRoom}
                beds={selectedRoomBeds}
                bookings={bookings}
                recommendedBeds={recommendedBeds}
                onBack={handleBack}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                {filteredRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    beds={getBedsForRoom(room.id)}
                    isSelected={selectedRoomId === room.id}
                    onSelect={() => selectRoom(room.id)}
                  />
                ))}
              </div>
            )}

            {/* 智能提示 */}
            {selectedRoom && recommendedBeds.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="font-medium text-green-800">智能推荐</p>
                    <p className="text-sm text-green-600 mt-1">
                      根据您的性别偏好，绿色高亮的床位是最佳选择，系统优先推荐同性聚集的区域
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：预订表单 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm onSuccess={handleBack} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
