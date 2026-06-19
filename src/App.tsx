import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingPage from '@/pages/BookingPage';
import AdminPage from '@/pages/AdminPage';

/**
 * 应用根组件 - 路由配置
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
