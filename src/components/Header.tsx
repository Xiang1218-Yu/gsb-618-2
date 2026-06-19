import { Home, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 头部导航组件
 */
export default function Header() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和品牌名 */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">旅途青旅</h1>
              <p className="text-xs text-teal-100">Hostel Booking</p>
            </div>
          </Link>

          {/* 导航链接 */}
          <nav className="flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                !isAdmin
                  ? 'bg-white text-teal-700 shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">预订房间</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isAdmin
                  ? 'bg-white text-teal-700 shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">管理后台</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
