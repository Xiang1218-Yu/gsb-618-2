import { useState } from 'react';
import { X, Calendar, Phone, User as UserIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Bed, Room, Gender } from '@/types';
import { getTodayStr } from '@/utils/storage';

interface BookingModalProps {
  room: Room;
  bed: Bed;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 预订弹窗表单 - 填写住客信息并提交预订
 */
export default function BookingModal({ room, bed, onClose, onSuccess }: BookingModalProps) {
  const { addBooking, selectedDate } = useStore();
  const today = getTodayStr();

  const [guestName, setGuestName] = useState('');
  const [guestGender, setGuestGender] = useState<Gender>('male');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState(selectedDate);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 基本校验
    if (!guestName.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!phone.trim()) {
      setError('请输入联系电话');
      return;
    }
    // 手机号格式校验：中国大陆11位手机号，1开头，第二位3-9
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setError('请输入正确的11位手机号');
      return;
    }
    if (checkInDate >= checkOutDate) {
      setError('退房日期必须晚于入住日期');
      return;
    }

    setSubmitting(true);

    // 提交预订（按入住日校验拼房，store内部会逐日校验）
    const result = addBooking({
      roomId: room.id,
      bedId: bed.id,
      guestName: guestName.trim(),
      guestGender,
      phone: phone.trim(),
      checkInDate,
      checkOutDate,
    });

    setSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-[#E86A33] to-[#d45a28] px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            预订 {room.name}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            选择了 {bed.bedNumber} 号床 · ¥{room.pricePerNight}/晚
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">住客姓名</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* 性别选择 */}
          <div>
            <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">性别</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGuestGender('male')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                  guestGender === 'male'
                    ? 'bg-sky-50 border-sky-400 text-sky-700'
                    : 'border-transparent bg-[#1A3C40]/5 text-[#1A3C40]/50 hover:bg-[#1A3C40]/10'
                }`}
              >
                男生
              </button>
              <button
                type="button"
                onClick={() => setGuestGender('female')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                  guestGender === 'female'
                    ? 'bg-pink-50 border-pink-400 text-pink-700'
                    : 'border-transparent bg-[#1A3C40]/5 text-[#1A3C40]/50 hover:bg-[#1A3C40]/10'
                }`}
              >
                女生
              </button>
            </div>
          </div>

          {/* 电话 */}
          <div>
            <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">联系电话</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* 入住/退房日期 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">入住日期</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
                <input
                  type="date"
                  value={checkInDate}
                  min={today}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A3C40] mb-1.5">退房日期</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C40]/40" />
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#1A3C40]/10 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* 价格摘要 */}
          <div className="bg-[#FAF6F0] rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-[#1A3C40]/60">预计总价</span>
            <span className="text-xl font-bold text-[#E86A33]">
              ¥
              {room.pricePerNight *
                Math.max(
                  1,
                  Math.ceil(
                    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}
            </span>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E86A33] to-[#d45a28] text-white font-bold text-sm shadow-lg shadow-[#E86A33]/30 hover:shadow-xl hover:shadow-[#E86A33]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {submitting ? '提交中...' : '确认预订'}
          </button>
        </form>
      </div>
    </div>
  );
}
