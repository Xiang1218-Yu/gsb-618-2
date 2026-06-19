// 预订成功页：展示订单详情
import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, BedDouble, Calendar, Phone, ArrowRight } from "lucide-react";
import TopNav from "@/components/TopNav";
import { useHostelData } from "@/hooks/useHostelData";
import { calcNights } from "@/lib/storage";

export default function BookingSuccess() {
  const location = useLocation();
  const { rooms, beds, bookings } = useHostelData();
  // 通过路由 state 拿到刚创建的订单 id 列表
  const ids: string[] = (location.state as { bookingIds?: string[] } | null)?.bookingIds ?? [];

  // 拼接出订单详情
  const items = ids
    .map((id) => bookings.find((b) => b.id === id))
    .filter(Boolean) as ReturnType<typeof bookings.filter>;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <TopNav />
        <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
          <p className="text-forest-500">未找到订单信息，可能页面已被刷新。</p>
          <Link to="/" className="btn-primary mt-6">返回首页</Link>
        </div>
      </div>
    );
  }

  const first = items[0];
  const nights = calcNights(first.checkIn, first.checkOut);
  const totalPrice = items.reduce((sum, bk) => {
    const bed = beds.find((b) => b.id === bk.bedId);
    const room = bed && rooms.find((r) => r.id === bed.roomId);
    return sum + (room ? room.pricePerNight * nights : 0);
  }, 0);

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-[800px] mx-auto px-6 py-12">
        {/* 成功提示 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-forest-500 text-cream flex items-center justify-center shadow-soft">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber2-500">/ Booking Confirmed /</p>
            <h1 className="font-display text-3xl text-forest-700">预订成功！</h1>
          </div>
        </div>

        {/* 订单卡片 */}
        <div className="bg-white rounded-2xl border border-forest-100 shadow-card overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-forest-500 to-forest-600 text-cream">
            <div className="text-xs uppercase tracking-wider opacity-80">订单编号</div>
            <div className="font-display text-2xl mt-1">{first.id}</div>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2"><Calendar size={14} />入住 {first.checkIn} → {first.checkOut}（{nights} 晚）</span>
              <span className="inline-flex items-center gap-2"><BedDouble size={14} />{items.length} 床位</span>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {items.map((bk) => {
              const bed = beds.find((b) => b.id === bk.bedId);
              const room = bed && rooms.find((r) => r.id === bed.roomId);
              return (
                <div key={bk.id} className="rounded-xl border border-forest-100 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-forest-700">{bk.guestName} <span className="text-xs text-forest-400 ml-1">{bk.gender === "male" ? "♂" : "♀"}</span></div>
                    <div className="text-xs text-forest-400 mt-0.5 inline-flex items-center gap-1"><Phone size={12} /> {bk.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-forest-700">{room?.name} · #{bed?.index}</div>
                    <div className="text-[11px] text-forest-400">{bed?.position === "upper" ? "上铺" : "下铺"} · ¥{room?.pricePerNight}/晚</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-cream/50 border-t border-forest-100 flex items-center justify-between">
            <div className="text-sm text-forest-500">合计</div>
            <div className="font-display text-3xl text-forest-700">¥{totalPrice}</div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 text-sm text-forest-500 leading-relaxed">
          <p>· 入住时间：当日 14:00 后；离店时间：次日 12:00 前。</p>
          <p>· 抵达前请保管好订单编号，可在管理端查询入住详情。</p>
        </div>

        <Link to="/" className="btn-ghost mt-8">
          继续浏览 <ArrowRight size={16} />
        </Link>
      </main>
    </div>
  );
}
