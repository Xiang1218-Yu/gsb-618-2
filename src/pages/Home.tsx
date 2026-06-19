// 旅客端首页：床位浏览、性别筛选、自动拼房、预订表单
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BedDouble } from "lucide-react";
import TopNav from "@/components/TopNav";
import FilterPanel from "@/components/FilterPanel";
import RoomCard from "@/components/RoomCard";
import BookingPanel, { type GuestInput } from "@/components/BookingPanel";
import { useHostelData, emitDataChange } from "@/hooks/useHostelData";
import {
  addBookings,
  calcNights,
  isBedOccupied,
  makeId,
  todayStr,
  tomorrowStr,
  type Booking,
  type GenderPreference,
  type Room,
} from "@/lib/storage";
import { autoMatch } from "@/lib/match";

/** 根据性别偏好过滤房间 */
function filterRoomsByPreference(rooms: Room[], pref: GenderPreference): Room[] {
  if (pref === "any") return rooms;
  return rooms.filter((r) => r.genderType === pref);
}

export default function Home() {
  const navigate = useNavigate();
  const { rooms, beds, bookings } = useHostelData();

  // ==== 筛选条件 ====
  const [checkIn, setCheckIn] = useState<string>(todayStr());
  const [checkOut, setCheckOut] = useState<string>(tomorrowStr());
  const [preference, setPreference] = useState<GenderPreference>("any");
  const [guestCount, setGuestCount] = useState<number>(1);

  // ==== 已选床位 + 入住人输入 ====
  const [selectedBedIds, setSelectedBedIds] = useState<string[]>([]);
  const [guests, setGuests] = useState<GuestInput[]>([{ name: "", gender: "male", phone: "" }]);

  // 同步 guests 数组长度与 guestCount
  const ensureGuestsLength = (n: number) => {
    setGuests((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ name: "", gender: "male", phone: "" });
      while (next.length > n) next.pop();
      return next;
    });
  };

  /** 切换某床位的选中状态 */
  const toggleBed = (bedId: string) => {
    if (isBedOccupied(bedId, checkIn, checkOut, bookings)) return;
    setSelectedBedIds((prev) => {
      // 已选中 -> 取消
      if (prev.includes(bedId)) {
        return prev.filter((b) => b !== bedId);
      }
      // 未选中 -> 受人数限制
      if (prev.length >= guestCount) {
        // 替换最早选中的，保持长度 = guestCount
        return [...prev.slice(1), bedId];
      }
      return [...prev, bedId];
    });
  };

  /** 修改入住人信息 */
  const updateGuest = (i: number, g: GuestInput) => {
    setGuests((prev) => {
      const next = [...prev];
      next[i] = g;
      return next;
    });
  };

  /** 自动拼房：基于当前已填写的性别（若空白则按全男处理） */
  const handleAutoMatch = () => {
    const sample = guests.slice(0, guestCount).map((g) => ({ gender: g.gender }));
    while (sample.length < guestCount) sample.push({ gender: "male" });

    const result = autoMatch({
      rooms,
      beds,
      bookings,
      guests: sample,
      preference,
      checkIn,
      checkOut,
    });

    if (!result) {
      alert("未找到符合条件的床位组合，请尝试调整日期、人数或性别偏好。");
      return;
    }
    setSelectedBedIds(result.bedIds);
  };

  /** 提交预订：写入 localStorage */
  const handleSubmit = () => {
    if (selectedBedIds.length !== guestCount) {
      alert(`请为 ${guestCount} 位入住人各选择一张床位`);
      return;
    }
    if (calcNights(checkIn, checkOut) <= 0) {
      alert("请选择有效的入住与离店日期");
      return;
    }
    for (const g of guests.slice(0, guestCount)) {
      if (!g.name.trim() || !g.phone.trim()) {
        alert("请填写每位入住人的姓名与手机号");
        return;
      }
    }

    // 创建批量订单
    const createdAt = new Date().toISOString();
    const groupOrderId = makeId("ord");
    const newBookings: Booking[] = selectedBedIds.map((bedId, idx) => ({
      id: idx === 0 ? groupOrderId : makeId("ord"),
      bedId,
      guestName: guests[idx].name.trim(),
      gender: guests[idx].gender,
      phone: guests[idx].phone.trim(),
      checkIn,
      checkOut,
      createdAt,
    }));

    addBookings(newBookings);
    emitDataChange();

    // 跳转到成功页（携带订单 id 列表）
    navigate("/booking-success", { state: { bookingIds: newBookings.map((b) => b.id) } });
  };

  // ==== 房间过滤 ====
  const visibleRooms = useMemo(() => filterRoomsByPreference(rooms, preference), [rooms, preference]);

  // 保持 guests 长度同步 guestCount
  useEffect(() => {
    ensureGuestsLength(guestCount);
    setSelectedBedIds((prev) => (prev.length > guestCount ? prev.slice(0, guestCount) : prev));
  }, [guestCount]);

  // 全局统计（顶部 hero 用）
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => isBedOccupied(b.id, checkIn, checkOut, bookings)).length;
  const freeBeds = totalBeds - occupiedBeds;

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero 标题区 */}
      <section className="max-w-[1200px] mx-auto px-6 pt-10 pb-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber2-500 mb-2">/ 床位级 · 实时预订 /</p>
            <h1 className="font-display text-4xl md:text-5xl text-forest-700 leading-tight max-w-2xl">
              在山间，挑一张<span className="italic text-amber2-500">属于你</span>的床。
            </h1>
            <p className="mt-3 text-forest-500 max-w-xl">
              支持多人混住、性别偏好筛选与自动拼房推荐——选好日期，剩下交给系统。
            </p>
          </div>
          {/* 实时床位统计 */}
          <div className="flex gap-3">
            <Stat icon={<BedDouble size={16} />} label="总床位" value={totalBeds} />
            <Stat icon={<Sparkles size={16} />} label="今夜可订" value={freeBeds} highlight />
          </div>
        </div>
      </section>

      {/* 主体三栏 */}
      <main className="max-w-[1200px] mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-6">
        {/* 左：筛选 */}
        <FilterPanel
          checkIn={checkIn}
          checkOut={checkOut}
          preference={preference}
          guestCount={guestCount}
          onChange={(next) => {
            if (next.checkIn !== undefined) setCheckIn(next.checkIn);
            if (next.checkOut !== undefined) setCheckOut(next.checkOut);
            if (next.preference !== undefined) {
              setPreference(next.preference);
              setSelectedBedIds([]);
            }
            if (next.guestCount !== undefined) {
              setGuestCount(next.guestCount);
              ensureGuestsLength(next.guestCount);
            }
          }}
        />

        {/* 中：房间列表 */}
        <section className="space-y-4">
          {visibleRooms.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-forest-200 p-8 text-center text-forest-400">
              当前筛选下没有匹配的房间，试试切换性别偏好。
            </div>
          )}
          {visibleRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              beds={beds}
              bookings={bookings}
              checkIn={checkIn}
              checkOut={checkOut}
              selectedBedIds={selectedBedIds}
              onToggleBed={toggleBed}
            />
          ))}
        </section>

        {/* 右：摘要 */}
        <BookingPanel
          rooms={rooms}
          beds={beds}
          bookings={bookings}
          selectedBedIds={selectedBedIds}
          guests={guests}
          onUpdateGuest={updateGuest}
          onRemoveSelected={(bedId) => setSelectedBedIds((prev) => prev.filter((b) => b !== bedId))}
          checkIn={checkIn}
          checkOut={checkOut}
          onAutoMatch={handleAutoMatch}
          onSubmit={handleSubmit}
          submitDisabled={selectedBedIds.length !== guestCount}
        />
      </main>
    </div>
  );
}

/** 顶部小统计卡 */
function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`px-4 py-3 rounded-xl border ${highlight ? "bg-forest-500 text-cream border-forest-500" : "bg-white border-forest-100 text-forest-600"} shadow-card min-w-[120px]`}>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5">{value}</div>
    </div>
  );
}
