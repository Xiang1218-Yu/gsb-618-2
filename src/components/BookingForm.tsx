// 订单编辑表单：新建或编辑订单
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import {
  isBedOccupied,
  type Bed,
  type Booking,
  type Gender,
  type Room,
} from "@/lib/storage";

interface BookingFormProps {
  open: boolean;
  initial?: Booking | null;
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
  onClose: () => void;
  onSubmit: (data: Omit<Booking, "id" | "createdAt">) => void;
}

const PHONE_REGEX = /^1[3-9]\d{9}$/;

export default function BookingForm({ open, initial, rooms, beds, bookings, onClose, onSubmit }: BookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [phone, setPhone] = useState("");
  const [bedId, setBedId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  // 同步初始值
  useEffect(() => {
    if (initial) {
      setGuestName(initial.guestName);
      setGender(initial.gender);
      setPhone(initial.phone);
      setBedId(initial.bedId);
      setCheckIn(initial.checkIn);
      setCheckOut(initial.checkOut);
    } else {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      setGuestName("");
      setGender("male");
      setPhone("");
      setBedId(beds[0]?.id ?? "");
      setCheckIn(today.toISOString().slice(0, 10));
      setCheckOut(tomorrow.toISOString().slice(0, 10));
    }
    setError("");
  }, [initial, open, beds]);

  // 床位选项（按房间分组展示）
  const bedOptions = useMemo(() => {
    return rooms.map((room) => ({
      room,
      beds: beds.filter((b) => b.roomId === room.id).sort((a, b) => a.index - b.index),
    }));
  }, [rooms, beds]);

  const handleSubmit = () => {
    if (!guestName.trim()) return setError("请填写姓名");
    if (!PHONE_REGEX.test(phone.trim())) return setError("手机号格式不正确（11 位、以 1 开头）");
    if (!bedId) return setError("请选择床位");
    if (!checkIn || !checkOut || checkIn >= checkOut) return setError("请选择有效的入住和离店日期");

    // 床位与房间性别匹配
    const bed = beds.find((b) => b.id === bedId);
    const room = bed && rooms.find((r) => r.id === bed.roomId);
    if (!bed || !room) return setError("床位信息异常");
    if (room.genderType === "male" && gender !== "male") return setError(`【${room.name}】为男生间，性别不匹配`);
    if (room.genderType === "female" && gender !== "female") return setError(`【${room.name}】为女生间，性别不匹配`);

    // 占用冲突检查（编辑时排除自身）
    const others = initial ? bookings.filter((b) => b.id !== initial.id) : bookings;
    if (isBedOccupied(bedId, checkIn, checkOut, others)) {
      return setError("所选日期内该床位已被占用，请更换床位或日期");
    }

    onSubmit({
      bedId,
      guestName: guestName.trim(),
      gender,
      phone: phone.trim(),
      checkIn,
      checkOut,
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "编辑订单" : "新增订单"}
      width={520}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>保存</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="姓名">
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="form-input" />
          </Field>
          <Field label="性别">
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="form-input">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </Field>
        </div>

        <Field label="手机号">
          <input
            value={phone}
            inputMode="numeric"
            maxLength={11}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="11 位手机号"
            className="form-input"
          />
        </Field>

        <Field label="床位">
          <select value={bedId} onChange={(e) => setBedId(e.target.value)} className="form-input">
            <option value="">请选择床位</option>
            {bedOptions.map(({ room, beds: rb }) => (
              <optgroup key={room.id} label={`${room.name}（${room.genderType === "male" ? "男" : room.genderType === "female" ? "女" : "混"}）`}>
                {rb.map((b) => (
                  <option key={b.id} value={b.id}>
                    {room.name} · #{b.index} · {b.position === "upper" ? "上铺" : "下铺"}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="入住日期">
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="form-input" />
          </Field>
          <Field label="离店日期">
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="form-input" />
          </Field>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-forest-400 block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
