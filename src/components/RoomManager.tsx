// 房间与床位管理面板：管理端 CRUD 房间、添加/删除床位
import { useState } from "react";
import { Plus, Pencil, Trash2, BedDouble, X } from "lucide-react";
import clsx from "clsx";
import RoomForm from "@/components/RoomForm";
import { emitDataChange } from "@/hooks/useHostelData";
import {
  addBed,
  addRoom,
  removeBed,
  removeRoom,
  updateRoom,
  type Bed,
  type Booking,
  type Room,
} from "@/lib/storage";

interface RoomManagerProps {
  rooms: Room[];
  beds: Bed[];
  bookings: Booking[];
}

const GENDER_LABEL: Record<Room["genderType"], string> = {
  male: "男生间",
  female: "女生间",
  mixed: "混住间",
};

export default function RoomManager({ rooms, beds, bookings }: RoomManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  /** 打开新增表单 */
  const openCreate = () => {
    setEditingRoom(null);
    setFormOpen(true);
  };

  /** 打开编辑表单 */
  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setFormOpen(true);
  };

  /** 表单提交：根据是否有 editingRoom 区分新建/编辑 */
  const handleSubmit = (data: Omit<Room, "id">) => {
    try {
      if (editingRoom) {
        updateRoom(editingRoom.id, data);
      } else {
        addRoom(data);
      }
      emitDataChange();
      setFormOpen(false);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  /** 删除房间（带级联提示） */
  const handleDeleteRoom = (room: Room) => {
    const bedIds = beds.filter((b) => b.roomId === room.id).map((b) => b.id);
    const occupiedCount = bookings.filter((bk) => bedIds.includes(bk.bedId)).length;
    const tip = occupiedCount > 0
      ? `房间「${room.name}」下有 ${occupiedCount} 条预订，将一并删除，是否继续？`
      : `确认删除房间「${room.name}」？`;
    if (!confirm(tip)) return;
    removeRoom(room.id);
    emitDataChange();
  };

  /** 添加床位 */
  const handleAddBed = (roomId: string) => {
    addBed(roomId);
    emitDataChange();
  };

  /** 删除床位 */
  const handleRemoveBed = (bed: Bed) => {
    if (!confirm(`确认删除该床位（#${bed.index}）？`)) return;
    try {
      removeBed(bed.id);
      emitDataChange();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-forest-700">房间与床位管理</h2>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> 新增房间
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rooms.map((room) => {
          const roomBeds = beds.filter((b) => b.roomId === room.id).sort((a, b) => a.index - b.index);
          const occupiedBedIds = new Set(bookings.map((bk) => bk.bedId));
          return (
            <div key={room.id} className="bg-white rounded-2xl border border-forest-100 shadow-card p-4">
              {/* 房间标题与操作 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-forest-700">{room.name}</div>
                  <div className="mt-1 text-[11px] text-forest-400 flex flex-wrap gap-2">
                    <span className="chip bg-forest-50 text-forest-500">{GENDER_LABEL[room.genderType]}</span>
                    <span className="chip bg-forest-50 text-forest-500">{room.floor}F</span>
                    <span className="chip bg-amber2-50 text-amber2-500">¥{room.pricePerNight}/晚</span>
                    <span className="chip bg-forest-50 text-forest-500">{room.capacity} 床</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(room)}
                    className="p-1.5 rounded-lg text-forest-500 hover:bg-forest-50"
                    title="编辑房间"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    title="删除房间"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 床位列表 */}
              <div className="grid grid-cols-4 gap-2">
                {roomBeds.map((bed) => {
                  const occupied = occupiedBedIds.has(bed.id);
                  return (
                    <div
                      key={bed.id}
                      className={clsx(
                        "relative rounded-lg border px-2 py-2 text-center text-[11px]",
                        occupied
                          ? "border-amber2-200 bg-amber2-50 text-amber2-500"
                          : "border-forest-100 bg-white text-forest-600",
                      )}
                    >
                      <BedDouble size={14} className="mx-auto" />
                      <div className="mt-0.5 font-medium">#{bed.index}</div>
                      <div className="text-[10px] opacity-70">{bed.position === "upper" ? "上铺" : "下铺"}</div>
                      {!occupied && (
                        <button
                          onClick={() => handleRemoveBed(bed)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-forest-100 text-red-500 hover:bg-red-50 flex items-center justify-center"
                          title="删除床位"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 添加床位按钮 */}
                <button
                  onClick={() => handleAddBed(room.id)}
                  className="rounded-lg border border-dashed border-forest-200 text-forest-400 hover:bg-forest-50 hover:text-forest-600 flex flex-col items-center justify-center text-[11px] py-3"
                >
                  <Plus size={16} />
                  加床
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 房间表单弹窗 */}
      <RoomForm
        open={formOpen}
        initial={editingRoom}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
