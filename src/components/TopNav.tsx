// 顶部导航栏组件：左侧 Logo、右侧入口
import { Link, useLocation } from "react-router-dom";
import { Hotel, ShieldCheck, Home } from "lucide-react";

export default function TopNav() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cream/80 border-b border-forest-100">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo 区域 */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-xl bg-forest-500 text-cream flex items-center justify-center shadow-soft group-hover:rotate-[-6deg] transition">
            <Hotel size={18} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-xl text-forest-700">Hostel Hive</div>
            <div className="text-[11px] tracking-[0.2em] text-forest-400 uppercase">床位级预订</div>
          </div>
        </Link>

        {/* 右侧入口 */}
        <nav className="flex items-center gap-2">
          {isAdmin ? (
            <Link to="/" className="btn-ghost text-sm">
              <Home size={16} />
              旅客端
            </Link>
          ) : (
            <Link to="/admin" className="btn-ghost text-sm">
              <ShieldCheck size={16} />
              管理端
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
