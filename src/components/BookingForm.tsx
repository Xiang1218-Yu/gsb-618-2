import { useState, useEffect } from 'react';
import { User, Phone, Users, CheckCircle, X, Sparkles, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import type { Gender, GenderPreference, BookingFormData } from '../types';

interface BookingFormProps {
  onSuccess?: () => void;
}

// 预订表单组件：填写入住人信息并提交预订
export default function BookingForm({ onSuccess }: BookingFormProps) {
  const { 
    selectedBeds, rooms, beds, createBooking, clearSelectedBeds,
    guestGender, genderPreference, setGuestGender, setGenderPreference
  } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<BookingFormData>({
    guestName: '',
    gender: guestGender,
    phone: '',
    checkIn: '',
    checkOut: '',
    genderPreference: genderPreference,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 同步全局性别和偏好到表单
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      gender: guestGender,
      genderPreference: genderPreference,
    }));
  }, [guestGender, genderPreference]);

  // 获取选中床位的总价格
  const getTotalPrice = () => {
    let total = 0;
    selectedBeds.forEach(bedId => {
      const bed = beds.find(b => b.id === bedId);
      if (bed) {
        const room = rooms.find(r => r.id === bed.roomId);
        if (room) total += room.pricePerBed;
      }
    });
    return total;
  };

  // 获取选中的床位信息
  const getSelectedBedsInfo = () => {
    return selectedBeds.map(bedId => {
      const bed = beds.find(b => b.id === bedId);
      if (!bed) return null;
      const room = rooms.find(r => r.id === bed.roomId);
      return { bed, room };
    }).filter(Boolean);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.guestName.trim()) {
      newErrors.guestName = '请输入姓名';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理性别选择，同时同步全局状态
  const handleGenderChange = (gender: Gender) => {
    setFormData({ ...formData, gender });
    setGuestGender(gender);
  };

  // 处理性别偏好选择，同时同步全局状态
  const handlePreferenceChange = (preference: GenderPreference) => {
    setFormData({ ...formData, genderPreference: preference });
    setGenderPreference(preference);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (selectedBeds.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = createBooking(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          guestName: '',
          gender: 'male',
          phone: '',
          checkIn: '',
          checkOut: '',
          genderPreference: 'any',
        });
        onSuccess?.();
      }, 2000);
    } else {
      setSubmitError(result.message);
      setTimeout(() => setSubmitError(''), 4000);
    }
  };

  const selectedInfo = getSelectedBedsInfo();

  if (selectedBeds.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🛏️</div>
          <h3 className="text-gray-600 font-medium mb-2">请选择床位</h3>
          <p className="text-gray-400 text-sm">选择房间后，点击床位进行预订</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center rounded-2xl">
          <div className="animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <p className="mt-4 text-lg font-bold text-gray-800">预订成功！</p>
          <p className="text-gray-500 text-sm mt-1">您的床位已保留</p>
        </div>
      )}

      {/* 提交错误提示 */}
      {submitError && (
        <div className="bg-red-50 border-b border-red-200 p-3 flex items-center gap-2 text-red-700 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 已选床位信息 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
            已选 {selectedBeds.length} 个床位
          </h3>
          <button
            onClick={clearSelectedBeds}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {selectedInfo.map((info, idx) => info && (
            <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-700">
                {info.room?.name} - {info.bed.bedNumber}
              </span>
              <span className="text-amber-600 font-medium">¥{info.room?.pricePerBed}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-amber-200">
          <span className="text-gray-600">总计</span>
          <span className="text-xl font-bold text-amber-600">¥{getTotalPrice()}</span>
        </div>
      </div>

      {/* 预订表单 */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            入住人姓名
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              placeholder="请输入姓名"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.guestName ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all`}
            />
          </div>
          {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
        </div>

        {/* 性别选择 - 与筛选栏同步 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            您的性别
            <span className="text-gray-400 font-normal ml-1">（与筛选栏同步）</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange('male')}
              className={`py-2.5 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'male'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>👨</span> 男生
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('female')}
              className={`py-2.5 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'female'
                  ? 'border-pink-400 bg-pink-50 text-pink-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>👩</span> 女生
            </button>
          </div>
        </div>

        {/* 手机号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            联系电话
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* 性别偏好 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Users className="w-4 h-4 inline mr-1" />
            拼房偏好
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'female_only', label: '仅女生', emoji: '👩', disabled: formData.gender === 'male' },
              { value: 'any', label: '都可以', emoji: '👥', disabled: false },
              { value: 'male_only', label: '仅男生', emoji: '👨', disabled: formData.gender === 'female' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => !opt.disabled && handlePreferenceChange(opt.value as GenderPreference)}
                disabled={opt.disabled}
                className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  opt.disabled
                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : formData.genderPreference === opt.value
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">系统将校验您选择的房间与性别是否匹配</p>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              提交中...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              确认预订
            </>
          )}
        </button>
      </form>
    </div>
  );
}
