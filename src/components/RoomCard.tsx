// 单间房间卡片：展示房间信息与床位网格
import { Users, MapPin, BadgeDollarSign } from "lucide-react";
import clsx from "clsx";
import type { Bed, Booking, Gender, Room } from "@/lib/storage";
import { getRoomCurrentGender, isBedOccupied } from "@/lib/storage";
import BedCell from "@/components/BedCell";

interface RoomCardProps {
  room: Room;
  beds: Bed[];
  bookings: Booking[];
  checkIn: string;
  checkOut: string;
  selectedBedIds: string[];
  onToggleBed: (bedId: string) => void;
}

const GENDER_LABEL: Record<Room["genderType"], string> = {
  male: "男生间",
  female: "女生间",
  mixed: "混住间",
};

const GENDER_COLOR: Record<Room["genderType"], string> = {
  male: "bg-blue-100 text-blue-700",
  female: "bg-pink-100 text-pink-700",
  mixed: "bg-forest-100 text-forest-700",
};

export default function RoomCard({ room, beds, bookings, checkIn, checkOut, selectedBedIds, onToggleBed }: RoomCardProps) {
  const roomBeds = beds.filter((b) => b.roomId === room.id).sort((a, b) => a.index - b.index);

  // 该房间在所选日期范围内的占用情况
  const bedIdToOccupant = new Map<string, Gender>();
  for (const bk of bookings) {
    if (
      roomBeds.some((b) => b.id === bk.bedId) &&
      bk.checkIn < checkOut &&
      checkIn < bk.checkOut
    ) {
      bedIdToOccupant.set(bk.bedId, bk.gender);
    }
  }

  const freeCount = roomBeds.filter((b) => !isBedOccupied(b.id, checkIn, checkOut, bookings)).length;
  const currentGender = getRoomCurrentGender(room, checkIn, checkOut, beds, bookings);

  return (
    <article className="bg-white rounded-2xl shadow-card border border-forest-100 p-5 transition hover:shadow-soft hover:-translate-y-0.5">
      {/* 顶部信息行 */}
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl text-forest-700">{room.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-forest-500">
            <span className={clsx("chip", GENDER_COLOR[room.genderType])}>{GENDER_LABEL[room.genderType]}</span>
            <span className="chip bg-forest-50 text-forest-500">
              <Users size={12} /> {room.capacity} 床
            </span>
            <span className="chip bg-forest-50 text-forest-500">
              <MapPin size={12} /> {room.floor}F
            </span>
            <span className="chip bg-amber2-50 text-amber2-500">
              <BadgeDollarSign size={12} /> ¥{room.pricePerNight}/晚
            </span>
            {room.genderType === "mixed" && currentGender && (
              <span className={clsx("chip", currentGender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600")}>
                当前以{currentGender === "male" ? "男士" : "女士"}为主
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-forest-700">{freeCount}</div>
          <div className="text-[11px] text-forest-400 uppercase tracking-wider">空闲床</div>
        </div>
      </header>

      {/* 床位网格 */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
        {roomBeds.map((bed) => {
          const occupantGender = bedIdToOccupant.get(bed.id);
          const occupied = !!occupantGender;
          const selected = selectedBedIds.includes(bed.id);
          const status = selected ? "selected" : occupied ? "occupied" : "free";
          return (
            <BedCell
              key={bed.id}
              index={bed.index}
              position={bed.position}
              status={status}
              occupantGender={occupantGender}
              onClick={() => onToggleBed(bed.id)}
            />
          );
        })}
      </div>
    </article>
  );
}
