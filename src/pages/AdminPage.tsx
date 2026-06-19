import { useState } from 'react';
import { Calendar, RotateCcw, Plus, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import AdminStats from '@/components/AdminStats';
import BookingTable from '@/components/BookingTable';
import RoomStatusBoard from '@/components/RoomStatusBoard';
import { getTodayStr, formatDate } from '@/utils/storage';
import type { GenderPolicy, RoomType } from '@/types';

/**
 * 管理页面 - 管理员查看统计数据、入住名单、房间状态、配置房间
 */
export default function AdminPage() {
  const { selectedDate, setSelectedDate, resetData, addRoom } = useStore();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 新房间表单
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'dorm_4' as RoomType,
    capacity: 4,
    genderPolicy: 'mixed' as GenderPolicy,
    pricePerNight: 68,
  });

  const handleAddRoom = () => {
    if (!newRoom.name.trim()) return;
    addRoom(newRoom);
    setNewRoom({ name: '', type: 'dorm_4', capacity: 4, genderPolicy: 'mixed', pricePerNight: 68 });
    setShowAddRoom(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            管理后台
          </h2>
          <p className="text-[#1A3C40]/50 mt-1 text-sm">
            查看 {formatDate(selectedDate)} 入住情况，管理预订和房间
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 日期选择 */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#1A3C40]/10 text-sm focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none bg-white"
            />
          </div>
          {/* 添加房间 */}
          <button
            type="button"
            onClick={() => setShowAddRoom(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A3C40] text-white text-sm font-medium hover:bg-[#1A3C40]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加房间
          </button>
          {/* 重置数据 */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A3C40]/10 text-[#1A3C40]/60 text-sm font-medium hover:bg-[#1A3C40]/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <AdminStats />

      {/* 入住名单表格 */}
      <BookingTable />

      {/* 房间状态看板 */}
      <RoomStatusBoard />

      {/* 添加房间弹窗 */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1A3C40]/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A3C40]">添加新房间</h3>
              <button
                type="button"
                onClick={() => setShowAddRoom(false)}
                className="w-8 h-8 rounded-full hover:bg-[#1A3C40]/5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">房间名称</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="如：阳光四人间"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">房间类型</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => {
                    const type = e.target.value as RoomType;
                    const cap = type === 'private' ? 1 : type === 'dorm_4' ? 4 : type === 'dorm_6' ? 6 : 8;
                    setNewRoom({ ...newRoom, type, capacity: cap });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none text-sm bg-white"
                >
                  <option value="dorm_4">4人宿舍</option>
                  <option value="dorm_6">6人宿舍</option>
                  <option value="dorm_8">8人宿舍</option>
                  <option value="private">大床房（私人）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">性别政策</label>
                <select
                  value={newRoom.genderPolicy}
                  onChange={(e) => setNewRoom({ ...newRoom, genderPolicy: e.target.value as GenderPolicy })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none text-sm bg-white"
                >
                  <option value="mixed">混住（自动匹配同性别）</option>
                  <option value="male_only">仅男生</option>
                  <option value="female_only">仅女生</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">每晚价格（元）</label>
                <input
                  type="number"
                  value={newRoom.pricePerNight}
                  onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: Number(e.target.value) })}
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddRoom}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E86A33] to-[#d45a28] text-white font-bold text-sm shadow-lg shadow-[#E86A33]/30 hover:shadow-xl transition-all"
              >
                创建房间
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置确认弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1A3C40] mb-2">确认重置数据？</h3>
            <p className="text-sm text-[#1A3C40]/60 mb-6">
              此操作将清除所有预订记录并恢复初始房间配置，无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#1A3C40]/10 text-[#1A3C40] font-medium text-sm hover:bg-[#1A3C40]/5 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
