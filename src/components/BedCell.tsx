// 床位 icon 单元格：展示空闲 / 已占 / 选中三种状态
import { BedDouble } from "lucide-react";
import clsx from "clsx";

export type BedStatus = "free" | "occupied" | "selected";

interface BedCellProps {
  index: number;
  position: "upper" | "lower";
  status: BedStatus;
  /** 已占用时显示的旅客性别（用于配色） */
  occupantGender?: "male" | "female";
  /** 是否禁用点击 */
  disabled?: boolean;
  onClick?: () => void;
}

export default function BedCell({ index, position, status, occupantGender, disabled, onClick }: BedCellProps) {
  // 不同状态下的样式
  const base = "relative w-full aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-medium border transition select-none";

  const statusStyle =
    status === "free"
      ? "border-forest-300 text-forest-500 bg-white hover:bg-forest-50 cursor-pointer"
      : status === "selected"
        ? "border-amber2-400 bg-amber2-300 text-forest-700 animate-pulseRing cursor-pointer"
        : occupantGender === "male"
          ? "border-blue-200 bg-blue-50 text-blue-600 cursor-not-allowed"
          : occupantGender === "female"
            ? "border-pink-200 bg-pink-50 text-pink-600 cursor-not-allowed"
            : "border-forest-100 bg-forest-50 text-forest-300 cursor-not-allowed";

  return (
    <button
      type="button"
      disabled={disabled || status === "occupied"}
      onClick={onClick}
      className={clsx(base, statusStyle)}
      title={`#${index} · ${position === "upper" ? "上铺" : "下铺"}`}
    >
      <BedDouble size={20} strokeWidth={1.6} />
      <span className="mt-0.5">#{index}</span>
      <span className="text-[10px] opacity-70">{position === "upper" ? "上铺" : "下铺"}</span>
    </button>
  );
}
