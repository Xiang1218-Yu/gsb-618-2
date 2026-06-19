import { useEffect } from 'react';
import { Calendar, CheckCircle, Bed } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { roomMatchesFilter } from '../utils/roomMatcher';
import { calculateNights } from '../utils/date';
import Header from '../components/Header';
import GenderFilter from '../components/GenderFilter';
import RoomCard from '../components/RoomCard';
import BedMap from '../components/BedMap';
import BookingModal from '../components/BookingModal';

/**
 * 预订首页 - 房型展示、日期选择、床位选择
 */
export default function BookingPage() {
  const {
    rooms,
    beds,
    bookings,
    checkInDate,
    checkOutDate,
    genderFilter,
    selectedRoomId,
    selectedBedId,
    showBookingModal,
    bookingSuccess,
    successMessage,
    initializeStore,
    setCheckInDate,
    setCheckOutDate,
    setGenderFilter,
    selectRoom,
    selectBed,
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

  // 当前选中的房间和床位
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const selectedBed = beds.find(b => b.id === selectedBedId);

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            {/* 晚数显示 */}
            <div className="flex items-end">
              <div className="bg-teal-50 rounded-xl px-4 py-3 w-full text-center">
                <span className="text-2xl font-bold text-teal-700">{nights}</span>
                <span className="text-teal-600 ml-2">晚</span>
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
            selectedBedId={selectedBedId}
            onSelectBed={selectBed}
            onBook={openBookingModal}
          />
        )}
      </main>

      {/* 预订表单弹窗 */}
      {showBookingModal && selectedRoom && selectedBed && (
        <BookingModal
          room={selectedRoom}
          bed={selectedBed}
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
