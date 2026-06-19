import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingPage from '@/pages/BookingPage';
import AdminPage from '@/pages/AdminPage';

/**
 * 应用根组件 - 配置路由
 * /       -> 预订页面
 * /admin  -> 管理后台
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
