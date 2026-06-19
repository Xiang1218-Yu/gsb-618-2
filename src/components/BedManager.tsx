import { useState } from 'react';
import { Plus, Trash2, Wrench, ArrowUp, ArrowDown, AlertCircle, ChevronDown } from 'lucide-react';
import type { Bed, BedPosition, BedStatus } from '../types';
import { useBookingStore } from '../store/useBookingStore';

// 床位状态标签配置
const statusLabels: Record<BedStatus, { label: string; color: string }> = {
  available: { label: '空闲', color: 'bg-green-100 text-green-700' },
  booked: { label: '已预订', color: 'bg-blue-100 text-blue-700' },
  selected: { label: '选中中', color: 'bg-amber-100 text-amber-700' },
  maintenance: { label: '维护中', color: 'bg-gray-100 text-gray-600' },
};

// 床位管理组件：支持添加、删除床位，切换维护状态
export default function BedManager() {
  const { rooms, beds, bookings, addBed, deleteBed, toggleBedMaintenance } = useBookingStore();
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 显示消息提示
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 处理添加床位
  const handleAddBed = (roomId: string, position: BedPosition) => {
    const result = addBed(roomId, position);
    showMessage(result.success ? 'success' : 'error', result.message);
  };

  // 处理删除床位
  const handleDeleteBed = (bed: Bed) => {
    if (window.confirm(`确定要删除「${bed.bedNumber}」吗？`)) {
      const result = deleteBed(bed.id);
      showMessage(result.success ? 'success' : 'error', result.message);
    }
  };

  // 切换房间展开/折叠
  const toggleRoom = (roomId: string) => {
    setExpandedRoomId(expandedRoomId === roomId ? null : roomId);
  };

  // 获取床位的预订信息
  const getBookingForBed = (bedId: string) => {
    return bookings.find(b => b.bedId === bedId && (b.status === 'confirmed' || b.status === 'checked_in'));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* 头部 */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          床位管理
        </h3>
        <p className="text-sm text-gray-500 mt-1">管理各房间的床位，支持添加、删除和维护状态切换</p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`p-3 flex items-center gap-2 text-sm animate-fade-in ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : null}
          {message.text}
        </div>
      )}

      {/* 房间列表 */}
      <div className="divide-y divide-gray-50">
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🛏️</div>
            <p>暂无房间，请先添加房间</p>
          </div>
        ) : (
          rooms.map(room => {
            const roomBeds = beds.filter(b => b.roomId === room.id);
            const isExpanded = expandedRoomId === room.id;
            
            return (
              <div key={room.id}>
                {/* 房间标题栏 - 点击展开/折叠 */}
                <div
                  onClick={() => toggleRoom(room.id)}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <div>
                      <span className="font-medium text-gray-800">{room.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({roomBeds.length}张床位)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">
                      空闲 {roomBeds.filter(b => b.status === 'available').length}
                    </span>
                    <span className="text-sm text-blue-600">
                      已订 {roomBeds.filter(b => b.status === 'booked').length}
                    </span>
                  </div>
                </div>

                {/* 展开的床位列表 */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50">
                    {/* 添加上/下铺按钮 */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleAddBed(room.id, 'upper')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <ArrowUp className="w-3 h-3" />
                        加上铺
                      </button>
                      <button
                        onClick={() => handleAddBed(room.id, 'lower')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <ArrowDown className="w-3 h-3" />
                        加下铺
                      </button>
                    </div>

                    {/* 床位网格 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {roomBeds.map(bed => {
                        const booking = getBookingForBed(bed.id);
                        const statusInfo = statusLabels[bed.status];
                        
                        return (
                          <div
                            key={bed.id}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              bed.status === 'available' ? 'bg-white border-green-200' :
                              bed.status === 'booked' ? 'bg-blue-50 border-blue-200' :
                              bed.status === 'maintenance' ? 'bg-gray-100 border-gray-300' :
                              'bg-amber-50 border-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {bed.position === 'upper' ? <ArrowUp className="w-4 h-4 text-gray-400" /> : <ArrowDown className="w-4 h-4 text-gray-400" />}
                                <span className="font-medium text-sm">{bed.bedNumber}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            {/* 入住人信息 */}
                            {booking && (
                              <div className="text-xs text-gray-500 mb-2">
                                入住人: {booking.guestName} {booking.gender === 'male' ? '👨' : '👩'}
                              </div>
                            )}
                            
                            {/* 操作按钮 */}
                            <div className="flex gap-1">
                              {bed.status !== 'booked' && (
                                <button
                                  onClick={() => toggleBedMaintenance(bed.id)}
                                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                                    bed.status === 'maintenance'
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  }`}
                                  title={bed.status === 'maintenance' ? '恢复可用' : '设为维护'}
                                >
                                  {bed.status === 'maintenance' ? '恢复' : '维护'}
                                </button>
                              )}
                              {bed.status !== 'booked' && (
                                <button
                                  onClick={() => handleDeleteBed(bed)}
                                  className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                  title="删除床位"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
