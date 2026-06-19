import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

/**
 * 预订成功提示弹窗
 */
export default function SuccessToast({ message, onClose }: SuccessToastProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-[#1A3C40] mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          预订成功！
        </h3>
        <p className="text-[#1A3C40]/60 text-sm mb-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E86A33] to-[#d45a28] text-white font-bold text-sm shadow-lg shadow-[#E86A33]/30 hover:shadow-xl transition-all"
        >
          好的，知道了
        </button>
      </div>
    </div>
  );
}
