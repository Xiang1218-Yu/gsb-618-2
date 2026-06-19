import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'purple';
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-700',
  },
};

// 统计卡片组件：展示关键指标
export default function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-5 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${colors.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
