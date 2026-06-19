import { useState, useMemo } from 'react';
import { Pencil, Trash2, X, Save, Search, Filter, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import type { Booking as BookingType, Gender, BookingStatus, Bed, Room } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { formatDate } from '../utils/storage';

// 状态选项配置
const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'confirmed', label: '已确认', color: 'bg-blue-100 text-blue-700' },
  { value: 'checked_in', label: '已入住', color: 'bg-green-100 text-green-700' },
  { value: 'checked_out', label: '已退房', color: 'bg-gray-100 text-gray-600' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-600' },
];

// 订单编辑表单数据
interface BookingEditForm {
  guestName: string;
  gender: Gender;
  phone: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
}

// 订单管理组件：支持查看、编辑、删除所有订单
export default function BookingManager() {
  const { bookings, rooms, beds, updateBooking, deleteBooking } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBooking, setEditingBooking] = useState<BookingType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState<BookingEditForm>({
    guestName: '',
    gender: 'male',
    phone: '',
    checkIn: '',
    checkOut: '',
    status: 'confirmed',
  });
  const pageSize = 10;

  // 显示消息提示
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 过滤订单列表
  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        // 状态筛选
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        // 搜索筛选
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return b.guestName.toLowerCase().includes(q) || 
                 b.phone.includes(q) ||
                 getRoomName(b.roomId).toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, searchQuery, statusFilter]);

  // 分页
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  // 获取房间名称
  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || '未知房间';
  };

  // 获取床位号
  const getBedNumber = (bedId: string) => {
    return beds.find(b => b.id === bedId)?.bedNumber || '未知床位';
  };

  // 打开编辑弹窗
  const handleEdit = (booking: BookingType) => {
    setEditingBooking(booking);
    setEditForm({
      guestName: booking.guestName,
      gender: booking.gender,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
    });
    setShowModal(true);
  };

  // 删除订单
  const handleDelete = (booking: BookingType) => {
    if (window.confirm(`确定要删除 ${booking.guestName} 的预订记录吗？此操作不可恢复。`)) {
      deleteBooking(booking.id);
      showMessage('success', '预订记录已删除');
    }
  };

  // 提交编辑
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    if (!editForm.guestName.trim()) {
      showMessage('error', '请输入入住人姓名');
      return;
    }
    if (!editForm.phone.trim()) {
      showMessage('error', '请输入手机号');
      return;
    }
    if (editForm.checkIn >= editForm.checkOut) {
      showMessage('error', '离店日期必须晚于入住日期');
      return;
    }

    const result = updateBooking(editingBooking.id, editForm);
    if (result.success) {
      showMessage('success', '订单更新成功');
      setShowModal(false);
    } else {
      showMessage('error', result.message);
    }
  };

  // 获取性别图标
  const getGenderIcon = (gender: Gender) => gender === 'male' ? '👨' : '👩';

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* 头部 */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          订单管理
          <span className="text-sm font-normal text-gray-500">（共 {bookings.length} 条记录）</span>
        </h3>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="搜索姓名、电话、房间..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as BookingStatus | 'all'); setCurrentPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm bg-white"
            >
              <option value="all">全部状态</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`p-3 flex items-center gap-2 text-sm animate-fade-in ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 桌面端表格 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客人</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">房间床位</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">入住日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">联系电话</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  暂无订单记录
                </td>
              </tr>
            ) : (
              paginatedBookings.map(booking => {
                const statusInfo = statusOptions.find(s => s.value === booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getGenderIcon(booking.gender)}</span>
                        <span className="font-medium text-gray-800">{booking.guestName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getRoomName(booking.roomId)}<br/>
                      <span className="text-gray-400">{getBedNumber(booking.bedId)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="编辑订单"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="删除订单"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片列表 */}
      <div className="md:hidden divide-y divide-gray-50">
        {paginatedBookings.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            暂无订单记录
          </div>
        ) : (
          paginatedBookings.map(booking => {
            const statusInfo = statusOptions.find(s => s.value === booking.status);
            return (
              <div key={booking.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getGenderIcon(booking.gender)}</span>
                    <span className="font-bold text-gray-800">{booking.guestName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(booking)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🛏️ {getRoomName(booking.roomId)} - {getBedNumber(booking.bedId)}</div>
                  <div>📅 {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</div>
                  <div>📱 {booking.phone}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            第 {currentPage} / {totalPages} 页，共 {filteredBookings.length} 条
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-amber-500 text-white'
                    : 'border border-gray-200 hover:bg-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 编辑订单弹窗 */}
      {showModal && editingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">编辑订单</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">入住人姓名</label>
                <input
                  type="text"
                  value={editForm.guestName}
                  onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>
              
              {/* 性别 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">性别</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, gender: 'male' })}
                    className={`py-2.5 rounded-lg border-2 font-medium transition-all ${
                      editForm.gender === 'male'
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    👨 男生
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, gender: 'female' })}
                    className={`py-2.5 rounded-lg border-2 font-medium transition-all ${
                      editForm.gender === 'female'
                        ? 'border-pink-400 bg-pink-50 text-pink-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    👩 女生
                  </button>
                </div>
              </div>
              
              {/* 电话 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>
              
              {/* 日期 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">入住日期</label>
                  <input
                    type="date"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">离店日期</label>
                  <input
                    type="date"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">订单状态</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as BookingStatus })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
