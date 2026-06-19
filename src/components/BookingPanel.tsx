// 预订摘要面板（右侧 sticky）：展示已选床位、入住人信息、提交按钮
import { useMemo } from "react";
import { CheckCircle2, X, Wand2 } from "lucide-react";
import clsx from "clsx";
import type { Bed, Booking, Gender, Room } from "@/lib/storage";
import { calcNights } from "@/lib/storage";

export interface GuestInput {
  name: string;
  gender: Gender;
  phone: string;
}

interface BookingPanelProps {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
  selectedBedIds: string[];
  guests: GuestInput[];
  onUpdateGuest: (i: number, g: GuestInput) => void;
  onRemoveSelected: (bedId: string) => void;
  checkIn: string;
  checkOut: string;
  onAutoMatch: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export default function BookingPanel({
  rooms,
  beds,
  selectedBedIds,
  guests,
  onUpdateGuest,
  onRemoveSelected,
  checkIn,
  checkOut,
  onAutoMatch,
  onSubmit,
  submitDisabled,
}: BookingPanelProps) {
  // 床位 -> 房间映射
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const bedMap = useMemo(() => new Map(beds.map((b) => [b.id, b])), [beds]);

  const nights = calcNights(checkIn, checkOut);

  // 总价计算
  const totalPrice = useMemo(() => {
    return selectedBedIds.reduce((sum, bedId) => {
      const bed = bedMap.get(bedId);
      const room = bed ? roomMap.get(bed.roomId) : undefined;
      return sum + (room ? room.pricePerNight : 0) * nights;
    }, 0);
  }, [selectedBedIds, bedMap, roomMap, nights]);

  return (
    <aside className="bg-white rounded-2xl border border-forest-100 shadow-card p-5 sticky top-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl text-forest-700">预订摘要</h3>
        <button
          type="button"
          onClick={onAutoMatch}
          className="text-xs inline-flex items-center gap-1 text-amber2-500 hover:text-amber2-400"
        >
          <Wand2 size={14} /> 自动拼房
        </button>
      </div>

      {/* 床位列表 */}
      <div className="space-y-2">
        {selectedBedIds.length === 0 && (
          <div className="text-sm text-forest-400 bg-forest-50/50 rounded-xl p-4 border border-dashed border-forest-200">
            请先选择床位，或点击"自动拼房"
          </div>
        )}
        {selectedBedIds.map((bedId, idx) => {
          const bed = bedMap.get(bedId);
          const room = bed ? roomMap.get(bed.roomId) : undefined;
          if (!bed || !room) return null;
          return (
            <div key={bedId} className="rounded-xl border border-forest-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-forest-700">{room.name} · #{bed.index}</div>
                  <div className="text-[11px] text-forest-400">
                    {bed.position === "upper" ? "上铺" : "下铺"} · ¥{room.pricePerNight}/晚
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSelected(bedId)}
                  className="text-forest-400 hover:text-red-500"
                  aria-label="移除床位"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 入住人输入 */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="col-span-2 px-3 py-2 rounded-lg border border-forest-100 text-sm focus:outline-none focus:border-forest-300"
                  placeholder="入住人姓名"
                  value={guests[idx]?.name ?? ""}
                  onChange={(e) => onUpdateGuest(idx, { ...(guests[idx] ?? { name: "", gender: "male", phone: "" }), name: e.target.value })}
                />
                <select
                  className="px-3 py-2 rounded-lg border border-forest-100 text-sm bg-white"
                  value={guests[idx]?.gender ?? "male"}
                  onChange={(e) => onUpdateGuest(idx, { ...(guests[idx] ?? { name: "", gender: "male", phone: "" }), gender: e.target.value as Gender })}
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
                <input
                  className="px-3 py-2 rounded-lg border border-forest-100 text-sm focus:outline-none focus:border-forest-300"
                  placeholder="手机号"
                  value={guests[idx]?.phone ?? ""}
                  onChange={(e) => onUpdateGuest(idx, { ...(guests[idx] ?? { name: "", gender: "male", phone: "" }), phone: e.target.value })}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 价格总计 */}
      <div className="mt-4 pt-4 border-t border-forest-100">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-forest-400">{selectedBedIds.length} 床 × {nights || 0} 晚</span>
          <span className="font-display text-3xl text-forest-700">¥{totalPrice}</span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className={clsx(
            "btn-primary w-full",
            submitDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <CheckCircle2 size={18} /> 确认预订
        </button>
      </div>
    </aside>
  );
}
