import { User, UserCircle, Check } from 'lucide-react';
import type { Bed, Booking } from '@/types';

interface BedItemProps {
  bed: Bed;
  booking?: Booking;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
}

/**
 * 单个床位组件 - 圆形图标展示，颜色编码状态
 *
 * 颜色规则：
 * - 绿色(可预订): 空床
 * - 蓝色(女性住客): 已被女性预订
 * - 深蓝色(男性住客): 已被男性预订
 * - 灰色(已入住): 已办理入住
 * - 橙色边框(选中): 当前用户选中的床位
 */
export default function BedItem({ bed, booking, isSelected, isSelectable, onClick }: BedItemProps) {
  // 确定床位状态颜色
  let bgColor = 'bg-emerald-100 border-emerald-300 text-emerald-600'; // 空床 - 绿色
  let icon = null;
  let label = `${bed.bedNumber}号床`;
  let labelColor = 'text-emerald-600';

  if (booking) {
    if (booking.status === 'checked_in') {
      bgColor = 'bg-slate-200 border-slate-400 text-slate-600';
      labelColor = 'text-slate-500';
      icon = <Check className="w-5 h-5" />;
      label = `${bed.bedNumber}号 · 已入住`;
    } else if (booking.guestGender === 'female') {
      bgColor = 'bg-pink-100 border-pink-300 text-pink-600';
      labelColor = 'text-pink-600';
      icon = <User className="w-5 h-5" />;
      label = `${bed.bedNumber}号 · ${booking.guestName}`;
    } else {
      bgColor = 'bg-sky-100 border-sky-300 text-sky-600';
      labelColor = 'text-sky-600';
      icon = <UserCircle className="w-5 h-5" />;
      label = `${bed.bedNumber}号 · ${booking.guestName}`;
    }
  }

  // 选中状态：橙色边框高亮
  const selectedRing = isSelected
    ? 'ring-4 ring-[#E86A33] ring-offset-2 scale-110 shadow-lg'
    : '';

  // 不可选择的床位降低透明度
  const disabledStyle = !isSelectable && !booking ? 'opacity-40 cursor-not-allowed' : '';
  const cursorStyle = isSelectable ? 'cursor-pointer hover:scale-105' : 'cursor-default';

  return (
    <button
      type="button"
      onClick={isSelectable ? onClick : undefined}
      disabled={!isSelectable && !booking}
      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${cursorStyle} ${disabledStyle}`}
    >
      <div
        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-200 ${bgColor} ${selectedRing}`}
      >
        {icon || bed.bedNumber}
      </div>
      <span className={`text-xs font-medium ${labelColor} whitespace-nowrap`}>{label}</span>
    </button>
  );
}
