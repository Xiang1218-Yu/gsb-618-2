import { Home, Settings, Calendar } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { formatDate } from '../utils/storage';

// 导航栏组件：提供视图切换和日期选择功能
export default function Navbar() {
  const { currentView, setCurrentView, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate } = useBookingStore();

  return (
    <nav className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo和品牌名 */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🏠</div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-wide" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                巷里青旅
              </h1>
              <p className="text-amber-200 text-xs">温暖你的旅途</p>
            </div>
          </div>

          {/* 日期选择器 */}
          {currentView === 'booking' && (
            <div className="hidden md:flex items-center space-x-4 bg-amber-900/30 rounded-xl px-4 py-2">
              <Calendar className="w-4 h-4 text-amber-200" />
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <label className="text-amber-200 text-xs">入住</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="bg-transparent text-white text-sm border-b border-amber-400/50 focus:border-amber-300 outline-none cursor-pointer"
                  />
                </div>
                <span className="text-amber-300">→</span>
                <div className="flex flex-col">
                  <label className="text-amber-200 text-xs">离店</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate}
                    className="bg-transparent text-white text-sm border-b border-amber-400/50 focus:border-amber-300 outline-none cursor-pointer"
                  />
                </div>
                <span className="text-amber-200 text-sm ml-2">
                  共{Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))}晚
                </span>
              </div>
            </div>
          )}

          {/* 视图切换按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('booking')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'booking'
                  ? 'bg-white text-amber-800 shadow-md scale-105'
                  : 'text-amber-100 hover:bg-amber-600/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">预订</span>
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'admin'
                  ? 'bg-white text-amber-800 shadow-md scale-105'
                  : 'text-amber-100 hover:bg-amber-600/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium text-sm">管理</span>
            </button>
          </div>
        </div>

        {/* 移动端日期选择 */}
        {currentView === 'booking' && (
          <div className="md:hidden pb-3 flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-amber-200" />
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="bg-amber-900/40 text-white text-sm rounded px-2 py-1 flex-1"
            />
            <span className="text-amber-300">→</span>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate}
              className="bg-amber-900/40 text-white text-sm rounded px-2 py-1 flex-1"
            />
          </div>
        )}
      </div>
    </nav>
  );
}
