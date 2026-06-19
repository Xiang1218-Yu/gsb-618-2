import { useState, useEffect } from 'react';
import { X, Phone, User, FileText, Venus, Mars, Calendar, CreditCard, ChevronDown, ChevronUp, BedDouble } from 'lucide-react';
import type { Room, Bed, Gender } from '../types';
import type { GuestFormData } from '../store/useBookingStore';
import { calculateNights } from '../utils/date';
import { genderAllowed } from '../utils/roomMatcher';
import { validatePhone } from '../utils/validation';

/**
 * 多人预订表单弹窗组件
 */

interface BookingModalProps {
  room: Room;
  selectedBeds: Bed[];
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onSubmit: (data: {
    guests: GuestFormData[];
    notes: string;
  }) => { success: boolean; message: string };
}

// 单个住客表单组件
function GuestFormItem({
  index,
  bedNumber,
  bedType,
  data,
  onChange,
  room,
}: {
  index: number;
  bedNumber: number;
  bedType: string;
  data: GuestFormData;
  onChange: (data: GuestFormData) => void;
  room: Room;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const genderBlocked = !genderAllowed(room, data.guestGender);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      genderBlocked ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
    }`}>
      {/* 头部 - 点击展开/收起 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800 flex items-center gap-2">
              第{index + 1}位住客
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                {bedNumber}号{bedType === 'upper' ? '上铺' : '下铺'}
              </span>
            </div>
            {data.guestName && (
              <div className="text-sm text-gray-500">{data.guestName}</div>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* 表单内容 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              住客姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.guestName}
              onChange={(e) => onChange({ ...data, guestName: e.target.value })}
              placeholder="请输入姓名"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          {/* 性别选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...data, guestGender: 'female' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  data.guestGender === 'female'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Venus className="w-5 h-5" />
                女生
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...data, guestGender: 'male' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  data.guestGender === 'male'
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
              手机号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ ...data, phone: e.target.value })}
              placeholder="请输入11位手机号"
              maxLength={11}
              className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
                data.phone && !validatePhone(data.phone)
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
            />
            {data.phone && !validatePhone(data.phone) && (
              <p className="mt-1 text-xs text-red-500">请输入正确的11位手机号</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingModal({
  room,
  selectedBeds,
  checkIn,
  checkOut,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const guestCount = selectedBeds.length;

  // 初始化每个住客表单数据
  const [guests, setGuests] = useState<GuestFormData[]>(() =>
    Array.from({ length: guestCount }, () => ({
      guestName: '',
      guestGender: 'female' as Gender,
      phone: '',
    }))
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // 当床位数量变化时重置
  useEffect(() => {
    setGuests(Array.from({ length: guestCount }, () => ({
      guestName: '',
      guestGender: 'female' as Gender,
      phone: '',
    })));
  }, [guestCount]);

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = room.pricePerNight * nights * guestCount;

  const updateGuest = (index: number, data: GuestFormData) => {
    const newGuests = [...guests];
    newGuests[index] = data;
    setGuests(newGuests);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 提交前最终校验
    for (let i = 0; i < guestCount; i++) {
      const g = guests[i];
      if (!g.guestName.trim()) {
        setError(`请填写第${i + 1}位住客姓名`);
        return;
      }
      if (!validatePhone(g.phone)) {
        setError(`第${i + 1}位住客手机号格式不正确，请输入11位手机号`);
        return;
      }
      if (!genderAllowed(room, g.guestGender)) {
        setError(`第${i + 1}位住客性别不符合房间限制`);
        return;
      }
    }

    const result = onSubmit({ guests, notes });
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-5 flex-shrink-0">
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
        <div className="bg-teal-50 px-5 py-4 border-b border-teal-100 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{checkIn} 入住</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{checkOut} 离店</span>
            </div>
            <div className="col-span-2 text-gray-700 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-teal-600" />
              <span className="font-medium">{room.name}</span>
              <span className="text-teal-600">
                · {guestCount}个床位（{selectedBeds.map(b => `${b.bedNumber}号${b.bedType === 'upper' ? '上' : '下'}`).join('、')}）
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-lg font-bold text-orange-600">
              <CreditCard className="w-5 h-5" />
              共{nights}晚 · {guestCount}人，总价 ¥{totalPrice}
            </div>
          </div>
        </div>

        {/* 表单区域 - 可滚动 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 住客列表 */}
          <div className="space-y-3">
            {selectedBeds.map((bed, idx) => (
              <GuestFormItem
                key={bed.id}
                index={idx}
                bedNumber={bed.bedNumber}
                bedType={bed.bedType}
                data={guests[idx]}
                onChange={(d) => updateGuest(idx, d)}
                room={room}
              />
            ))}
          </div>

          {/* 公共备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              特殊要求（选填，所有住客共用）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如有特殊需求请备注..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
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
            className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            确认预订 · ¥{totalPrice}
          </button>
        </form>
      </div>
    </div>
  );
}
