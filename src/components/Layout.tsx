import { NavLink, Outlet } from 'react-router-dom';
import { Home, Settings, Hotel } from 'lucide-react';

/**
 * 全局布局组件，包含顶部导航栏
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E86A33]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E86A33] to-[#d45a28] flex items-center justify-center shadow-md">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1A3C40]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  栖迟青旅
                </h1>
                <p className="text-xs text-[#1A3C40]/50 -mt-0.5">Hostel Booking</p>
              </div>
            </div>

            {/* 导航Tab */}
            <nav className="flex items-center gap-1 bg-[#1A3C40]/5 rounded-full p-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E86A33] text-white shadow-md'
                      : 'text-[#1A3C40]/70 hover:text-[#1A3C40] hover:bg-white/60'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                <span>预订</span>
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E86A33] text-white shadow-md'
                      : 'text-[#1A3C40]/70 hover:text-[#1A3C40] hover:bg-white/60'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span>管理</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* 底部 */}
      <footer className="mt-auto py-6 text-center text-sm text-[#1A3C40]/40">
        <p>栖迟青旅 · 床位预订管理系统 · 数据存储于本地浏览器</p>
      </footer>
    </div>
  );
}
