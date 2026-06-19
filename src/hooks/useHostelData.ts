// useHostelData：负责加载/订阅本地存储中的房间、床位、预订数据
import { useCallback, useEffect, useState } from "react";
import type { Bed, Booking, Room } from "@/lib/storage";
import { ensureSeed, getBeds, getBookings, getRooms } from "@/lib/storage";

const REFRESH_EVENT = "hostel:dataChange";

/** 触发全局刷新（写入 localStorage 后调用） */
export function emitDataChange() {
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

export function useHostelData() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const refresh = useCallback(() => {
    setRooms(getRooms());
    setBeds(getBeds());
    setBookings(getBookings());
  }, []);

  useEffect(() => {
    ensureSeed();
    refresh();
    // 监听本窗口数据变更
    const onChange = () => refresh();
    window.addEventListener(REFRESH_EVENT, onChange);
    // 监听其他标签页的 localStorage 变更
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(REFRESH_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { rooms, beds, bookings, refresh };
}
