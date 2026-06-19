import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Bed, Users, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import type { Room, RoomType } from '../types';
import { useBookingStore } from '../store/useBookingStore';

// 房间类型选项配置
const roomTypeOptions: { value: RoomType; label: string; emoji: string; color: string }[] = [
  { value: 'dorm_male', label: '男生多人间', emoji: '👨', color: 'bg-blue-100 text-blue-700' },
  { value: 'dorm_female', label: '女生多人间', emoji: '👩', color: 'bg-pink-100 text-pink-700' },
  { value: 'dorm_mixed', label: '混住多人间', emoji: '👥', color: 'bg-purple-100 text-purple-700' },
  { value: 'private', label: '包间', emoji: '🏡', color: 'bg-amber-100 text-amber-700' },
];

// 房间表单数据类型
interface RoomFormData {
  name: string;
  type: RoomType;
  capacity: number;
  pricePerBed: number;
  description: string;
  isActive: boolean;
}

// 房间管理组件：支持添加、编辑、删除房间
export default function RoomManager() {
  const { rooms, beds, addRoom, updateRoom, deleteRoom } = useBookingStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    type: 'dorm_mixed',
    capacity: 4,
    pricePerBed: 68,
    description: '',
    isActive: true,
  });

  // 显示添加房间弹窗
  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      type: 'dorm_mixed',
      capacity: 4,
      pricePerBed: 68,
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  // 显示编辑房间弹窗
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      pricePerBed: room.pricePerBed,
      description: room.description,
      isActive: room.isActive,
    });
    setShowModal(true);
  };

  // 处理删除房间
  const handleDelete = (room: Room) => {
    if (window.confirm(`确定要删除房间「${room.name}」吗？此操作不可恢复。`)) {
      const result = deleteRoom(room.id);
      showMessage(result.success ? 'success' : 'error', result.message);
    }
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showMessage('error', '请输入房间名称');
      return;
    }
    if (formData.capacity < 1) {
      showMessage('error', '房间容量至少为1个床位');
      return;
    }
    if (formData.pricePerBed < 0) {
      showMessage('error', '价格不能为负数');
      return;
    }

    let result;
    if (editingRoom) {
      result = updateRoom(editingRoom.id, formData);
    } else {
      result = addRoom(formData);
    }

    if (result.success) {
      showMessage('success', result.message);
      setShowModal(false);
    } else {
      showMessage('error', result.message);
    }
  };

  // 显示消息提示
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 获取房间的床位数量
  const getBedCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId).length;
  };

  // 获取房间的可用床位
  const getAvailableBedCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId && b.status === 'available').length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* 头部 */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <Bed className="w-5 h-5 text-amber-600" />
          房间管理
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加房间
        </button>
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
            <div className="text-4xl mb-2">🏠</div>
            <p>暂无房间，点击上方按钮添加</p>
          </div>
        ) : (
          rooms.map(room => {
            const typeInfo = roomTypeOptions.find(t => t.value === room.type);
            const bedCount = getBedCount(room.id);
            const availableCount = getAvailableBedCount(room.id);
            
            return (
              <div key={room.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800">{room.name}</span>
                      {typeInfo && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.emoji} {typeInfo.label}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        room.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {room.isActive ? '营业中' : '已停用'}
                      </span>
                    </div>
                    
                    {room.description && (
                      <p className="text-sm text-gray-500 mb-2">{room.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {bedCount}张床位
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        空闲 {availableCount} 位
                      </span>
                      <span className="font-bold text-amber-600">¥{room.pricePerBed}/晚</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => {
                        updateRoom(room.id, { isActive: !room.isActive });
                        showMessage('success', room.isActive ? '房间已停用' : '房间已启用');
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      title={room.isActive ? '停用房间' : '启用房间'}
                    >
                      {room.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="编辑房间"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="删除房间"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 添加/编辑房间弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingRoom ? '编辑房间' : '添加新房间'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* 房间名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  房间名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：阳光男生四人间"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>
              
              {/* 房间类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  房间类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roomTypeOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: opt.value })}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                        formData.type === opt.value
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{opt.emoji}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 容量和价格 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    床位数量 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    每床价格（元/晚）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricePerBed}
                    onChange={(e) => setFormData({ ...formData, pricePerBed: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* 房间描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  房间描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述房间设施和特色..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
                />
              </div>
              
              {/* 启用状态 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
                <span className="text-sm text-gray-700">
                  {formData.isActive ? '房间已启用，可接受预订' : '房间已停用，不显示在预订列表'}
                </span>
              </div>
              
              {/* 按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingRoom ? '保存修改' : '添加房间'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
