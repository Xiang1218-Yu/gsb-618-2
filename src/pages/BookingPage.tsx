import { useEffect } from 'react';
import { Calendar, CheckCircle, Bed, Users, Minus, Plus } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { roomMatchesFilter } from '../utils/roomMatcher';
import { calculateNights } from '../utils/date';
import Header from '../components/Header';
import GenderFilter from '../components/GenderFilter';
import RoomCard from '../components/RoomCard';
import BedMap from '../components/BedMap';
import BookingModal from '../components/BookingModal';

/**
 * 预订首页 - 房型展示、日期选择、床位选择、多人预订
 */
export default function BookingPage() {
  const {
    rooms,
    beds,
    bookings,
    checkInDate,
    checkOutDate,
    genderFilter,
    guestCount,
    selectedRoomId,
    selectedBedIds,
    showBookingModal,
    bookingSuccess,
    successMessage,
    initializeStore,
    setCheckInDate,
    setCheckOutDate,
    setGenderFilter,
    setGuestCount,
    selectRoom,
    toggleBed,
    openBookingModal,
    closeBookingModal,
    submitBooking,
    resetSelection,
  } = useBookingStore();

  // 初始化数据
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // 筛选房间
  const filteredRooms = rooms.filter(r => roomMatchesFilter(r, genderFilter));

  // 当前选中的房间和床位列表
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const selectedBeds = beds.filter(b => selectedBedIds.includes(b.id));

  // 入住晚数
  const nights = checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 预订成功提示 */}
        {bookingSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4 animate-fadeIn">
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-800 text-lg">预订成功！🎉</h3>
              <p className="text-green-700 mt-1">{successMessage}</p>
              <p className="text-green-600 text-sm mt-2">
                您可在「管理后台」查看实时入住名单
              </p>
            </div>
          </div>
        )}

        {/* 搜索筛选区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            选择入住日期
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* 入住日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">入住日期</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            {/* 离店日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">离店日期</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            {/* 入住人数 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Users className="w-4 h-4 inline mr-1" />入住人数
              </label>
              <div className="flex items-center h-[50px]">
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount - 1)}
                  disabled={guestCount <= 1}
                  className={`w-10 h-full rounded-l-xl border border-r-0 flex items-center justify-center transition-all ${
                    guestCount <= 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border-gray-200'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-full border border-gray-200 flex items-center justify-center bg-white">
                  <span className="text-xl font-bold text-teal-700 tabular-nums">{guestCount}</span>
                  <span className="text-gray-500 ml-1">人</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  disabled={guestCount >= 8}
                  className={`w-10 h-full rounded-r-xl border border-l-0 flex items-center justify-center transition-all ${
                    guestCount >= 8
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* 晚数和总价预览 */}
            <div className="flex items-end">
              <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl px-4 py-3 w-full text-center">
                <div>
                  <span className="text-2xl font-bold text-teal-700">{nights}</span>
                  <span className="text-teal-600 ml-1">晚</span>
                </div>
                {selectedRoom && (
                  <div className="text-sm text-orange-600 font-medium mt-0.5">
                    约 ¥{selectedRoom.pricePerNight * nights * guestCount}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 性别筛选 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">性别偏好筛选</h3>
            <GenderFilter selected={genderFilter} onChange={setGenderFilter} />
          </div>
        </div>

        {/* 房型列表 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Bed className="w-6 h-6 text-teal-600" />
              选择房间
              <span className="text-sm font-normal text-gray-500">（共{filteredRooms.length}间）</span>
            </h2>
            {selectedRoomId && (
              <button
                onClick={resetSelection}
                className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
              >
                重新选择房间
              </button>
            )}
          </div>

          {/* 房间卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                beds={beds}
                bookings={bookings}
                checkIn={checkInDate}
                checkOut={checkOutDate}
                isSelected={selectedRoomId === room.id}
                onSelect={() => selectRoom(room.id)}
              />
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bed className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>当前筛选条件下没有可用房间</p>
            </div>
          )}
        </div>

        {/* 床位平面图 - 选中房间后显示 */}
        {selectedRoom && (
          <BedMap
            room={selectedRoom}
            beds={beds}
            bookings={bookings}
            checkIn={checkInDate}
            checkOut={checkOutDate}
            selectedBedIds={selectedBedIds}
            guestCount={guestCount}
            onToggleBed={toggleBed}
            onBook={openBookingModal}
          />
        )}
      </main>

      {/* 预订表单弹窗 */}
      {showBookingModal && selectedRoom && selectedBeds.length > 0 && (
        <BookingModal
          room={selectedRoom}
          selectedBeds={selectedBeds}
          checkIn={checkInDate}
          checkOut={checkOutDate}
          onClose={closeBookingModal}
          onSubmit={submitBooking}
        />
      )}

      {/* 页脚 */}
      <footer className="mt-16 py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/50">
        <p>旅途青旅 · 本地演示版 · 数据存储于浏览器本地</p>
      </footer>
    </div>
  );
}
