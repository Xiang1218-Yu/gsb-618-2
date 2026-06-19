import { Users, Venus, Mars, Shuffle } from 'lucide-react';
import type { GenderFilter } from '../types';

/**
 * 性别偏好筛选组件
 */

interface GenderFilterProps {
  selected: GenderFilter;
  onChange: (filter: GenderFilter) => void;
}

interface FilterOption {
  value: GenderFilter;
  label: string;
  icon: React.ReactNode;
}

const options: FilterOption[] = [
  { value: 'all', label: '全部房型', icon: <Users className="w-4 h-4" /> },
  { value: 'female-only', label: '女生房', icon: <Venus className="w-4 h-4" /> },
  { value: 'male-only', label: '男生房', icon: <Mars className="w-4 h-4" /> },
  { value: 'mixed', label: '混住房', icon: <Shuffle className="w-4 h-4" /> },
];

export default function GenderFilter({ selected, onChange }: GenderFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
            selected === opt.value
              ? 'bg-teal-600 text-white shadow-md scale-105'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700'
          }`}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
