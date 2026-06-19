// 应用根路由：旅客端 / 预订成功 / 管理端
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BookingSuccess from "@/pages/BookingSuccess";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
