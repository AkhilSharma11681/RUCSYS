import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DetailItem {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
}

interface DetailGridProps {
  items: DetailItem[];
  columns?: 2 | 3;
  className?: string;
}

export const DetailGrid: React.FC<DetailGridProps> = ({ items, columns = 3, className = '' }) => {
  return (
    <div
      className={`grid gap-4 ${
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
      } ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col space-y-1">
          <div className="flex items-center text-[#6B6B6B]">
            {item.icon && <item.icon className="w-3.5 h-3.5 mr-1" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          <div className="text-sm text-[#1a1a1a] font-medium leading-tight">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
