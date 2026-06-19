// 筛选栏：日期、性别偏好、人数
import { Calendar, Users, Filter } from "lucide-react";
import clsx from "clsx";
import type { GenderPreference } from "@/lib/storage";

interface FilterPanelProps {
  checkIn: string;
  checkOut: string;
  preference: GenderPreference;
  guestCount: number;
  onChange: (next: { checkIn?: string; checkOut?: string; preference?: GenderPreference; guestCount?: number }) => void;
}

const PREF_OPTIONS: { value: GenderPreference; label: string; desc: string }[] = [
  { value: "any", label: "不限", desc: "任意房型" },
  { value: "male", label: "男生间", desc: "仅男士房" },
  { value: "female", label: "女生间", desc: "仅女士房" },
  { value: "mixed", label: "混住间", desc: "性别混住" },
];

export default function FilterPanel({ checkIn, checkOut, preference, guestCount, onChange }: FilterPanelProps) {
  return (
    <section className="bg-white rounded-2xl border border-forest-100 shadow-card p-5 space-y-5">
      <div className="flex items-center gap-2 text-forest-700">
        <Filter size={16} />
        <h3 className="font-display text-lg">查找床位</h3>
      </div>

      {/* 日期 */}
      <div>
        <label className="text-xs uppercase tracking-wider text-forest-400 flex items-center gap-1 mb-2">
          <Calendar size={12} /> 入住日期
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-forest-100 text-sm focus:outline-none focus:border-forest-300"
          />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-forest-100 text-sm focus:outline-none focus:border-forest-300"
          />
        </div>
      </div>

      {/* 人数 */}
      <div>
        <label className="text-xs uppercase tracking-wider text-forest-400 flex items-center gap-1 mb-2">
          <Users size={12} /> 入住人数
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-xl border border-forest-100 hover:bg-forest-50 text-forest-600"
            onClick={() => onChange({ guestCount: Math.max(1, guestCount - 1) })}
          >
            −
          </button>
          <div className="flex-1 text-center font-display text-xl text-forest-700">{guestCount}</div>
          <button
            type="button"
            className="w-9 h-9 rounded-xl border border-forest-100 hover:bg-forest-50 text-forest-600"
            onClick={() => onChange({ guestCount: Math.min(8, guestCount + 1) })}
          >
            +
          </button>
        </div>
      </div>

      {/* 性别偏好 */}
      <div>
        <label className="text-xs uppercase tracking-wider text-forest-400 mb-2 block">性别偏好</label>
        <div className="grid grid-cols-2 gap-2">
          {PREF_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preference: opt.value })}
              className={clsx(
                "rounded-xl border px-3 py-2.5 text-left transition",
                preference === opt.value
                  ? "border-forest-500 bg-forest-500 text-cream shadow-soft"
                  : "border-forest-100 hover:border-forest-300 text-forest-600",
              )}
            >
              <div className="text-sm font-medium">{opt.label}</div>
              <div className={clsx("text-[11px]", preference === opt.value ? "text-cream/80" : "text-forest-400")}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
