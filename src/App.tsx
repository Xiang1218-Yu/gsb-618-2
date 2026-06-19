import { useEffect } from 'react';
import Navbar from './components/Navbar';
import BookingHall from './pages/BookingHall';
import AdminDashboard from './pages/AdminDashboard';
import { useBookingStore } from './store/useBookingStore';

// 应用主组件：负责初始化数据和视图切换
export default function App() {
  const { currentView, initData, isLoaded } = useBookingStore();

  // 组件挂载时初始化数据
  useEffect(() => {
    initData();
  }, [initData]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏠</div>
          <p className="text-gray-500">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {currentView === 'booking' ? <BookingHall /> : <AdminDashboard />}
    </div>
  );
}
