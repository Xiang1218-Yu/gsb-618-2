// 管理端：登录、入住名单、占用看板、统计、房间&订单 CRUD
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  LogOut,
  Trash2,
  RotateCcw,
  Users2,
  BedDouble,
  Sparkles,
  PieChart,
  Search,
  Plus,
  Pencil,
  LayoutGrid,
  ListChecks,
  Hotel,
} from "lucide-react";
import clsx from "clsx";
import TopNav from "@/components/TopNav";
import RoomManager from "@/components/RoomManager";
import BookingForm from "@/components/BookingForm";
import { useHostelData, emitDataChange } from "@/hooks/useHostelData";
import {
  addBooking,
  clearAdminToken,
  clearBookings,
  getAdminToken,
  makeId,
  removeBooking,
  resetSeed,
  setAdminToken,
  todayStr,
  updateBooking,
  type Booking,
} from "@/lib/storage";

const ADMIN_PASSWORD = "admin";

/** 顶层 Tab 类型 */
type AdminTab = "overview" | "bookings" | "rooms";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean>(!!getAdminToken());

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

/** 登录子组件 */
function Login({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pwd === ADMIN_PASSWORD) {
      setAdminToken("ok");
      onSuccess();
    } else {
      setError("密码不正确（提示：admin）");
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-[420px] mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl border border-forest-100 shadow-soft p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-forest-500 text-cream flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-amber2-500">/ Admin Panel /</p>
              <h1 className="font-display text-2xl text-forest-700">管理端登录</h1>
            </div>
          </div>
          <label className="text-xs text-forest-500 uppercase tracking-wider">访问密码</label>
          <input
            type="password"
            value={pwd}
            placeholder="请输入密码"
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mt-2 w-full px-4 py-3 rounded-xl border border-forest-100 focus:outline-none focus:border-forest-300"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button onClick={submit} className="btn-primary w-full mt-6">
            进入管理端
          </button>
          <p className="mt-4 text-[11px] text-forest-400 leading-relaxed">默认密码：admin（仅作演示，数据存储于本地浏览器）</p>
        </div>
      </main>
    </div>
  );
}

/** 管理端主面板 */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { rooms, beds, bookings } = useHostelData();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayStr());

  // 订单表单弹窗
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // ==== 统计数据 ====
  const stats = useMemo(() => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const dateEnd = next.toISOString().slice(0, 10);

    let occupied = 0;
    let male = 0;
    let female = 0;
    for (const bed of beds) {
      const occupant = bookings.find(
        (bk) => bk.bedId === bed.id && bk.checkIn < dateEnd && date < bk.checkOut,
      );
      if (occupant) {
        occupied++;
        if (occupant.gender === "male") male++;
        else female++;
      }
    }
    const total = beds.length;
    return {
      total,
      occupied,
      free: total - occupied,
      male,
      female,
      malePercent: occupied === 0 ? 0 : Math.round((male / occupied) * 100),
    };
  }, [beds, bookings, date]);

  // ==== 当日入住名单（Overview Tab 用） ====
  const todayList = useMemo(() => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const dateEnd = next.toISOString().slice(0, 10);
    const list = bookings.filter((bk) => bk.checkIn < dateEnd && date < bk.checkOut);
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (bk) =>
        bk.guestName.toLowerCase().includes(q) ||
        bk.phone.includes(q) ||
        bk.id.toLowerCase().includes(q),
    );
  }, [bookings, date, search]);

  // ==== 全部订单（Bookings Tab 用，含搜索） ====
  const allBookingsList = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(
      (bk) =>
        bk.guestName.toLowerCase().includes(q) ||
        bk.phone.includes(q) ||
        bk.id.toLowerCase().includes(q),
    );
  }, [bookings, search]);

  /** 删除订单 */
  const handleRemove = (id: string) => {
    if (!confirm("确定要退订该订单吗？")) return;
    removeBooking(id);
    emitDataChange();
  };

  /** 打开新增订单弹窗 */
  const openCreateBooking = () => {
    setEditingBooking(null);
    setBookingFormOpen(true);
  };

  /** 打开编辑订单弹窗 */
  const openEditBooking = (bk: Booking) => {
    setEditingBooking(bk);
    setBookingFormOpen(true);
  };

  /** 订单表单提交 */
  const handleBookingSubmit = (data: Omit<Booking, "id" | "createdAt">) => {
    if (editingBooking) {
      updateBooking(editingBooking.id, data);
    } else {
      addBooking({
        ...data,
        id: makeId("ord"),
        createdAt: new Date().toISOString(),
      });
    }
    emitDataChange();
    setBookingFormOpen(false);
  };

  /** 重置示例数据 */
  const handleReset = () => {
    if (!confirm("将清空所有订单并重新写入示例房间，是否继续？")) return;
    resetSeed();
    emitDataChange();
  };

  /** 仅清空预订 */
  const handleClearBookings = () => {
    if (!confirm("将删除所有预订记录（房间不变），是否继续？")) return;
    clearBookings();
    emitDataChange();
  };

  /** 退出登录 */
  const handleLogout = () => {
    clearAdminToken();
    onLogout();
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* 顶部标题与操作 */}
        <header className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber2-500 mb-1">/ Admin Dashboard /</p>
            <h1 className="font-display text-4xl text-forest-700">运营管理台</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClearBookings} className="btn-ghost text-sm">
              <Trash2 size={14} /> 清空预订
            </button>
            <button onClick={handleReset} className="btn-ghost text-sm">
              <RotateCcw size={14} /> 重置示例
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              <LogOut size={14} /> 退出
            </button>
          </div>
        </header>

        {/* Tab 切换 */}
        <nav className="flex items-center gap-1 mb-8 bg-white rounded-2xl border border-forest-100 p-1 w-fit shadow-card">
          <TabButton current={tab} value="overview" onClick={setTab} icon={<LayoutGrid size={14} />}>概览</TabButton>
          <TabButton current={tab} value="bookings" onClick={setTab} icon={<ListChecks size={14} />}>订单管理</TabButton>
          <TabButton current={tab} value="rooms" onClick={setTab} icon={<Hotel size={14} />}>房间管理</TabButton>
        </nav>

        {tab === "overview" && (
          <>
            {/* 日期切换 */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-forest-500">查看日期：</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-forest-100 text-sm"
              />
            </div>

            {/* 统计卡片 */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard icon={<BedDouble size={16} />} label="总床位" value={stats.total} />
              <StatCard icon={<Users2 size={16} />} label="已占用" value={stats.occupied} accent="amber" />
              <StatCard icon={<Sparkles size={16} />} label="空闲" value={stats.free} accent="forest" />
              <StatCard
                icon={<PieChart size={16} />}
                label="男 / 女"
                value={`${stats.male} / ${stats.female}`}
                sub={`${stats.malePercent}% 男`}
              />
            </section>

            {/* 床位占用看板 */}
            <section className="mb-10">
              <h2 className="font-display text-2xl text-forest-700 mb-3">床位占用看板</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map((room) => {
                  const roomBeds = beds.filter((b) => b.roomId === room.id).sort((a, b) => a.index - b.index);
                  return (
                    <div key={room.id} className="bg-white rounded-2xl border border-forest-100 shadow-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-forest-700">{room.name}</div>
                        <div className="text-xs text-forest-400">{room.floor}F · {room.capacity} 床</div>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {roomBeds.map((bed) => {
                          const next = new Date(date);
                          next.setDate(next.getDate() + 1);
                          const dateEnd = next.toISOString().slice(0, 10);
                          const occ = bookings.find(
                            (bk) => bk.bedId === bed.id && bk.checkIn < dateEnd && date < bk.checkOut,
                          );
                          const cls = !occ
                            ? "bg-forest-50 text-forest-300 border-forest-100"
                            : occ.gender === "male"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-pink-50 text-pink-600 border-pink-100";
                          return (
                            <div
                              key={bed.id}
                              className={clsx("aspect-square rounded-md border flex items-center justify-center text-[10px] font-medium", cls)}
                              title={occ ? `${occ.guestName} · ${occ.gender === "male" ? "男" : "女"}` : "空闲"}
                            >
                              {bed.index}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 当日入住名单（只读概览） */}
            <section>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <h2 className="font-display text-2xl text-forest-700">当日入住名单</h2>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    placeholder="搜索姓名/手机号/订单号"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl border border-forest-100 text-sm w-[260px] focus:outline-none focus:border-forest-300"
                  />
                </div>
              </div>
              <BookingTable
                list={todayList}
                rooms={rooms}
                beds={beds}
                onEdit={openEditBooking}
                onDelete={handleRemove}
              />
              <p className="mt-3 text-xs text-forest-400">共 {todayList.length} 条记录 · 全部订单 {bookings.length} 条</p>
            </section>
          </>
        )}

        {tab === "bookings" && (
          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="font-display text-2xl text-forest-700">订单管理</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    placeholder="搜索姓名/手机号/订单号"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl border border-forest-100 text-sm w-[260px] focus:outline-none focus:border-forest-300"
                  />
                </div>
                <button onClick={openCreateBooking} className="btn-primary text-sm">
                  <Plus size={14} /> 新增订单
                </button>
              </div>
            </div>
            <BookingTable
              list={allBookingsList}
              rooms={rooms}
              beds={beds}
              onEdit={openEditBooking}
              onDelete={handleRemove}
            />
            <p className="mt-3 text-xs text-forest-400">共 {allBookingsList.length} 条订单</p>
          </section>
        )}

        {tab === "rooms" && <RoomManager rooms={rooms} beds={beds} bookings={bookings} />}
      </main>

      {/* 订单编辑弹窗 */}
      <BookingForm
        open={bookingFormOpen}
        initial={editingBooking}
        rooms={rooms}
        beds={beds}
        bookings={bookings}
        onClose={() => setBookingFormOpen(false)}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}

/** 订单表格（含编辑/删除按钮） */
function BookingTable({
  list,
  rooms,
  beds,
  onEdit,
  onDelete,
}: {
  list: Booking[];
  rooms: { id: string; name: string }[];
  beds: { id: string; roomId: string; index: number }[];
  onEdit: (bk: Booking) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-forest-100 shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-cream/50">
          <tr className="text-left text-forest-500">
            <th className="px-4 py-3 font-medium">订单号</th>
            <th className="px-4 py-3 font-medium">姓名</th>
            <th className="px-4 py-3 font-medium">性别</th>
            <th className="px-4 py-3 font-medium">手机号</th>
            <th className="px-4 py-3 font-medium">床位</th>
            <th className="px-4 py-3 font-medium">入住</th>
            <th className="px-4 py-3 font-medium">离店</th>
            <th className="px-4 py-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-forest-400">
                暂无记录
              </td>
            </tr>
          )}
          {list.map((bk, i) => {
            const bed = beds.find((b) => b.id === bk.bedId);
            const room = bed && rooms.find((r) => r.id === bed.roomId);
            return (
              <tr key={bk.id} className={clsx("border-t border-forest-50", i % 2 === 1 && "bg-cream/30")}>
                <td className="px-4 py-3 font-mono text-[11px] text-forest-500">{bk.id.slice(-10)}</td>
                <td className="px-4 py-3 font-medium text-forest-700">{bk.guestName}</td>
                <td className="px-4 py-3">
                  <span className={clsx("chip", bk.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600")}>
                    {bk.gender === "male" ? "♂ 男" : "♀ 女"}
                  </span>
                </td>
                <td className="px-4 py-3 text-forest-500">{bk.phone}</td>
                <td className="px-4 py-3">
                  {room?.name ?? "—"} <span className="text-forest-400">#{bed?.index ?? "?"}</span>
                </td>
                <td className="px-4 py-3 text-forest-500">{bk.checkIn}</td>
                <td className="px-4 py-3 text-forest-500">{bk.checkOut}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onEdit(bk)}
                      className="p-1.5 rounded-md text-forest-500 hover:bg-forest-50"
                      title="编辑"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(bk.id)}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                      title="退订"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Tab 按钮 */
function TabButton({
  current,
  value,
  onClick,
  children,
  icon,
}: {
  current: AdminTab;
  value: AdminTab;
  onClick: (v: AdminTab) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={clsx(
        "px-4 py-2 rounded-xl text-sm inline-flex items-center gap-1.5 transition",
        active ? "bg-forest-500 text-cream shadow-soft" : "text-forest-500 hover:bg-forest-50",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** 统计卡片小组件 */
function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent?: "forest" | "amber";
}) {
  const cls =
    accent === "forest"
      ? "bg-forest-500 text-cream border-forest-500"
      : accent === "amber"
        ? "bg-amber2-300 text-forest-700 border-amber2-300"
        : "bg-white text-forest-700 border-forest-100";

  return (
    <div className={clsx("rounded-2xl border shadow-card p-4", cls)}>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <div className="font-display text-3xl mt-1">{value}</div>
      {sub && <div className="text-[11px] mt-0.5 opacity-70">{sub}</div>}
    </div>
  );
}
