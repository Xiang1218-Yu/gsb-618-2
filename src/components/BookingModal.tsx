import { useState } from 'react';
import { X, Phone, User, FileText, Venus, Mars, Calendar, CreditCard } from 'lucide-react';
import type { Room, Bed, Gender } from '../types';
import { calculateNights } from '../utils/date';
import { genderAllowed } from '../utils/roomMatcher';

/**
 * 预订表单弹窗组件
 */

interface BookingModalProps {
  room: Room;
  bed: Bed;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onSubmit: (data: {
    guestName: string;
    guestGender: Gender;
    phone: string;
    notes: string;
  }) => { success: boolean; message: string };
}

export default function BookingModal({
  room,
  bed,
  checkIn,
  checkOut,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [guestName, setGuestName] = useState('');
  const [guestGender, setGuestGender] = useState<Gender>('female');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = room.pricePerNight * nights;

  // 检查当前选择的性别是否符合房间限制
  const genderBlocked = !genderAllowed(room, guestGender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('请输入住客姓名');
      return;
    }
    if (!phone.trim()) {
      setError('请输入联系电话');
      return;
    }
    if (genderBlocked) {
      setError(`该房间仅限${room.genderRestriction === 'female-only' ? '女生' : '男生'}入住`);
      return;
    }

    const result = onSubmit({
      guestName: guestName.trim(),
      guestGender,
      phone: phone.trim(),
      notes: notes.trim(),
    });

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">填写预订信息</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 订单摘要 */}
        <div className="bg-teal-50 p-4 border-b border-teal-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{checkIn} 入住</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{checkOut} 离店</span>
            </div>
            <div className="col-span-2 text-gray-700 font-medium">
              {room.name} · {bed.bedNumber}号{bed.bedType === 'upper' ? '上铺' : '下铺'}
            </div>
            <div className="col-span-2 flex items-center gap-2 text-lg font-bold text-orange-600">
              <CreditCard className="w-5 h-5" />
              共{nights}晚，总价 ¥{totalPrice}
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              住客姓名
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          {/* 性别选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGuestGender('female')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  guestGender === 'female'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Venus className="w-5 h-5" />
                女生
              </button>
              <button
                type="button"
                onClick={() => setGuestGender('male')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  guestGender === 'male'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mars className="w-5 h-5" />
                男生
              </button>
            </div>
            {genderBlocked && (
              <p className="mt-2 text-sm text-red-500">
                ⚠️ 该房间为{room.genderRestriction === 'female-only' ? '女生专属房' : '男生专属房'}，
                {room.genderRestriction === 'female-only' ? '仅女生' : '仅男生'}可预订
              </p>
            )}
          </div>

          {/* 手机号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              联系电话
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              特殊要求（选填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如有特殊需求请备注..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={genderBlocked}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${
              genderBlocked
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            确认预订 · ¥{totalPrice}
          </button>
        </form>
      </div>
    </div>
  );
}
