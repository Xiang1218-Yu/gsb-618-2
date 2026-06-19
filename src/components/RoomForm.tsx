// 房间编辑表单：新建或编辑房间
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import type { Room, RoomGenderType } from "@/lib/storage";

interface RoomFormProps {
  open: boolean;
  initial?: Room | null;
  onClose: () => void;
  onSubmit: (data: Omit<Room, "id">) => void;
}

const GENDER_OPTIONS: { value: RoomGenderType; label: string }[] = [
  { value: "male", label: "男生间" },
  { value: "female", label: "女生间" },
  { value: "mixed", label: "混住间" },
];

export default function RoomForm({ open, initial, onClose, onSubmit }: RoomFormProps) {
  // 表单本地状态
  const [name, setName] = useState("");
  const [genderType, setGenderType] = useState<RoomGenderType>("mixed");
  const [capacity, setCapacity] = useState(4);
  const [pricePerNight, setPricePerNight] = useState(88);
  const [floor, setFloor] = useState(2);
  const [error, setError] = useState("");

  // 当 initial 变化时同步表单字段
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setGenderType(initial.genderType);
      setCapacity(initial.capacity);
      setPricePerNight(initial.pricePerNight);
      setFloor(initial.floor);
    } else {
      setName("");
      setGenderType("mixed");
      setCapacity(4);
      setPricePerNight(88);
      setFloor(2);
    }
    setError("");
  }, [initial, open]);

  const handleSubmit = () => {
    if (!name.trim()) return setError("请填写房间名称");
    if (capacity < 1 || capacity > 20) return setError("床位数应在 1-20 之间");
    if (pricePerNight < 0) return setError("价格不能为负");
    onSubmit({
      name: name.trim(),
      genderType,
      capacity,
      pricePerNight,
      floor,
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "编辑房间" : "新增房间"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>保存</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="房间名称">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：森林男士间"
            className="form-input"
          />
        </Field>

        <Field label="房间类型">
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setGenderType(o.value)}
                className={
                  "px-3 py-2 rounded-xl border text-sm transition " +
                  (genderType === o.value
                    ? "border-forest-500 bg-forest-500 text-cream"
                    : "border-forest-100 hover:border-forest-300 text-forest-600")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="床位数">
            <input
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
              className="form-input"
            />
          </Field>
          <Field label="价格 / 晚">
            <input
              type="number"
              min={0}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(parseInt(e.target.value || "0", 10))}
              className="form-input"
            />
          </Field>
          <Field label="楼层">
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(parseInt(e.target.value || "0", 10))}
              className="form-input"
            />
          </Field>
        </div>

        {initial && (
          <p className="text-xs text-amber2-500">
            修改床位数会同步增减床位；缩减时若末尾床位仍有预订占用将无法保存。
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}

/** 表单字段包装 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-forest-400 block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
