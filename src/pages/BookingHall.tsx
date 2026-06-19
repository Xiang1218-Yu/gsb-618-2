import { useState, useMemo } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import RoomCard from '../components/RoomCard';
import BedLayout from '../components/BedLayout';
import BookingForm from '../components/BookingForm';
import { recommendBeds } from '../utils/matching';
import type { GenderPreference } from '../types';

// 预订大厅页面：旅客预订主界面
export default function BookingHall() {
  const { 
    rooms, beds, bookings, selectedRoomId, selectRoom, 
    checkInDate, checkOutDate, guestGender, genderPreference,
    setGuestGender, setGenderPreference
  } = useBookingStore();
  const [errorMessage, setErrorMessage] = useState('');

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
      genderPreference,
      checkInDate,
      checkOutDate,
      2
    ).filter(id => beds.find(b => b.id === id)?.roomId === selectedRoomId);
  }, [rooms, beds, bookings, selectedRoomId, guestGender, genderPreference, checkInDate, checkOutDate]);

  // 过滤房间列表：根据性别和偏好筛选可用房型
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (!room.isActive) return false;
      
      // 选择男生时，不显示女生专用间
      if (guestGender === 'male' && room.type === 'dorm_female') {
        return false;
      }
      // 选择女生时，不显示男生专用间
      if (guestGender === 'female' && room.type === 'dorm_male') {
        return false;
      }
      
      // 拼房偏好筛选
      if (genderPreference === 'male_only') {
        return room.type === 'dorm_male' || room.type === 'dorm_mixed' || room.type === 'private';
      }
      if (genderPreference === 'female_only') {
        return room.type === 'dorm_female' || room.type === 'dorm_mixed' || room.type === 'private';
      }
      return true;
    });
  }, [rooms, guestGender, genderPreference]);

  // 获取房间对应的床位列表
  const getBedsForRoom = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId);
  };

  // 处理房间选择，添加性别校验
  const handleSelectRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // 校验性别与房型是否匹配
    if (guestGender === 'male' && room.type === 'dorm_female') {
      setErrorMessage('男生不能选择女生间，请选择其他房型');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (guestGender === 'female' && room.type === 'dorm_male') {
      setErrorMessage('女生不能选择男生间，请选择其他房型');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setErrorMessage('');
    selectRoom(roomId);
  };

  const handleBack = () => {
    selectRoom(null);
    setErrorMessage('');
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

        {/* 错误提示 */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            ⚠️ {errorMessage}
          </div>
        )}

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
                  { value: 'female_only', label: '👩 仅女生间', disabled: guestGender === 'male' },
                  { value: 'any', label: '👥 都可以', disabled: false },
                  { value: 'male_only', label: '👨 仅男生间', disabled: guestGender === 'female' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => !opt.disabled && setGenderPreference(opt.value as GenderPreference)}
                    disabled={opt.disabled}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      opt.disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : genderPreference === opt.value
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              💡 选择性别后将自动筛选合适房型，系统会为您推荐最佳床位
            </p>
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
                    onSelect={() => handleSelectRoom(room.id)}
                  />
                ))}
                {filteredRooms.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>没有符合条件的房间，请调整筛选条件</p>
                  </div>
                )}
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
