import { useState, useMemo } from 'react';
import { Calendar, Filter, Users, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';
import BedGrid from '@/components/BedGrid';
import BookingModal from '@/components/BookingModal';
import SuccessToast from '@/components/SuccessToast';
import type { Bed, Room } from '@/types';
import { getTodayStr, formatDate } from '@/utils/storage';

/**
 * 预订页面 - 住客浏览房间、选择床位、提交预订的主页面
 */
export default function BookingPage() {
  const { rooms, beds, selectedDate, genderFilter, setGenderFilter, setSelectedDate, getRoomGenderInfo } = useStore();

  // 选中的床位
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 按房间分组床位
  const bedsByRoom = useMemo(() => {
    const map: Record<string, Bed[]> = {};
    beds.forEach((b) => {
      if (!map[b.roomId]) map[b.roomId] = [];
      map[b.roomId].push(b);
    });
    return map;
  }, [beds]);

  // 根据性别筛选过滤房间
  const visibleRooms = useMemo(() => {
    if (genderFilter === 'all') return rooms;
    return rooms.filter((r) => {
      if (r.type === 'private') return true;
      if (genderFilter === 'male' && r.genderPolicy === 'female_only') return false;
      if (genderFilter === 'female' && r.genderPolicy === 'male_only') return false;
      // 混住房：如果该日期已有异性预订，则过滤掉
      const info = getRoomGenderInfo(r.id, selectedDate);
      if (genderFilter === 'male' && info.females > 0) return false;
      if (genderFilter === 'female' && info.males > 0) return false;
      return true;
    });
  }, [rooms, genderFilter, selectedDate, getRoomGenderInfo]);

  // 点击床位
  const handleSelectBed = (room: Room, bed: Bed) => {
    setSelectedRoom(room);
    setSelectedBed(bed);
    setShowModal(true);
  };

  // 预订成功
  const handleBookingSuccess = () => {
    setShowModal(false);
    setSelectedBed(null);
    setSelectedRoom(null);
    setSuccessMessage(`已成功预订 ${selectedRoom?.name} ${selectedBed?.bedNumber}号床，期待您的入住！`);
    setShowSuccess(true);
  };

  // 总统计
  const totalBeds = beds.length;
  const availableBeds = visibleRooms.reduce((sum, r) => {
    const roomBeds = bedsByRoom[r.id] || [];
    const { getAvailableBeds } = useStore.getState();
    return sum + getAvailableBeds(r.id, selectedDate).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题与统计 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            选择您的床位
          </h2>
          <p className="text-[#1A3C40]/50 mt-1 text-sm">
            {formatDate(selectedDate)} · 共 {totalBeds} 个床位，{availableBeds} 个可预订
          </p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1A3C40]/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* 日期选择 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1A3C40]/40" />
          <input
            type="date"
            value={selectedDate}
            min={getTodayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none text-sm"
          />
        </div>

        <div className="h-6 w-px bg-[#1A3C40]/10 hidden sm:block" />

        {/* 性别筛选 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1A3C40]/40" />
          <div className="flex gap-1 bg-[#1A3C40]/5 rounded-lg p-1">
            {[
              { key: 'all' as const, label: '全部', icon: Users },
              { key: 'female' as const, label: '女生', icon: '♀' },
              { key: 'male' as const, label: '男生', icon: '♂' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setGenderFilter(opt.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  genderFilter === opt.key
                    ? 'bg-white text-[#E86A33] shadow-sm'
                    : 'text-[#1A3C40]/50 hover:text-[#1A3C40]'
                }`}
              >
                {typeof opt.icon === 'string' ? opt.icon : <opt.icon className="w-3.5 h-3.5 inline mr-1" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 图例说明 */}
        <div className="flex items-center gap-3 sm:ml-auto text-xs text-[#1A3C40]/50">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-400" /> 可订
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-pink-400" /> 女生
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-sky-400" /> 男生
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-400" /> 已入住
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      {genderFilter !== 'all' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E86A33]/5 border border-[#E86A33]/20 rounded-xl text-sm text-[#E86A33]">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            已筛选「{genderFilter === 'female' ? '女生优先' : '男生优先'}」，系统将自动过滤不适合拼房的床位
          </span>
        </div>
      )}

      {/* 房间网格 */}
      {visibleRooms.length === 0 ? (
        <div className="text-center py-16 text-[#1A3C40]/40">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>当前筛选条件下没有可用房间</p>
          <p className="text-sm mt-1">请尝试更换日期或筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleRooms.map((room) => (
            <BedGrid
              key={room.id}
              room={room}
              beds={bedsByRoom[room.id] || []}
              selectedBedId={selectedBed?.id || null}
              onSelectBed={(bedId) => {
                const bed = (bedsByRoom[room.id] || []).find((b) => b.id === bedId);
                if (bed) handleSelectBed(room, bed);
              }}
            />
          ))}
        </div>
      )}

      {/* 预订弹窗 */}
      {showModal && selectedRoom && selectedBed && (
        <BookingModal
          room={selectedRoom}
          bed={selectedBed}
          onClose={() => {
            setShowModal(false);
            setSelectedBed(null);
            setSelectedRoom(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* 成功提示 */}
      {showSuccess && (
        <SuccessToast message={successMessage} onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
