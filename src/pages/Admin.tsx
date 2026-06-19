// 管理端：登录、入住名单、占用看板、统计、数据管理
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import TopNav from "@/components/TopNav";
import { useHostelData, emitDataChange } from "@/hooks/useHostelData";
import {
  clearAdminToken,
  clearBookings,
  getAdminToken,
  removeBooking,
  resetSeed,
  setAdminToken,
  todayStr,
} from "@/lib/storage";

const ADMIN_PASSWORD = "admin";

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
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayStr());

  // ==== 统计数据 ====
  const stats = useMemo(() => {
    // 当前日期（单日）的占用：即 [date, date+1) 重叠
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

  // ==== 当日入住名单 ====
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

  /** 退订 */
  const handleRemove = (id: string) => {
    if (!confirm("确定要退订该订单吗？")) return;
    removeBooking(id);
    emitDataChange();
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

  // 当数据变化时，自动刷新由 useHostelData 处理
  useEffect(() => {
    /* placeholder：依赖 useHostelData 的事件订阅 */
  }, []);

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* 顶部标题与操作 */}
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
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

        {/* 入住名单 */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <h2 className="font-display text-2xl text-forest-700">实时入住名单</h2>
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
                {todayList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-forest-400">
                      该日期下暂无入住记录
                    </td>
                  </tr>
                )}
                {todayList.map((bk, i) => {
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
                      <td className="px-4 py-3">{room?.name} <span className="text-forest-400">#{bed?.index}</span></td>
                      <td className="px-4 py-3 text-forest-500">{bk.checkIn}</td>
                      <td className="px-4 py-3 text-forest-500">{bk.checkOut}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleRemove(bk.id)} className="text-red-500 hover:text-red-600 text-xs inline-flex items-center gap-1">
                          <Trash2 size={12} /> 退订
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 当占用看板需要查看完整预订时，显示总数 */}
          <p className="mt-3 text-xs text-forest-400">共 {todayList.length} 条记录 · 全部订单 {bookings.length} 条</p>
        </section>
      </main>
    </div>
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
