// 通用模态框：用于房间编辑、订单编辑等
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export default function Modal({ open, title, onClose, children, footer, width = 480 }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-700/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-soft border border-forest-100 w-full max-h-[90vh] flex flex-col"
        style={{ maxWidth: width }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-forest-100">
          <h3 className="font-display text-xl text-forest-700">{title}</h3>
          <button onClick={onClose} className="text-forest-400 hover:text-forest-600" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        {/* 主体 */}
        <div className="px-5 py-4 overflow-auto">{children}</div>
        {/* 底部按钮 */}
        {footer && <div className="px-5 py-4 border-t border-forest-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
