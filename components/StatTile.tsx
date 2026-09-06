'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: LucideIcon;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  interactive = false,
  onClick,
  className = '',
  isActive = false,
}) => {
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={`
        rounded-2xl p-4 text-left transition-all border
        ${
          isActive
            ? 'bg-[#FFF6F0] border-[#E4572E] shadow-sm ring-1 ring-[#E4572E]'
            : 'bg-white border-[#E8E0D8]/80 shadow-sm'
        }
        ${interactive ? 'hover:border-[#E4572E]/50 cursor-pointer active:scale-[0.98]' : 'cursor-default'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        {Icon && (
          <div className={`p-2 rounded-xl ${isActive ? 'text-[#E4572E] bg-[#E4572E]/10' : 'text-[#6B6B6B] bg-[#F5EDE6]'}`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
        <div className="text-right">
          <div className="text-3xl font-black text-[#1a1a1a] tracking-tight leading-none">
            {value}
          </div>
        </div>
      </div>
      <div className="text-[13px] font-bold text-[#6B6B6B] tracking-tight mt-3">
        {label}
      </div>
      {subtext && (
        <div className="text-[11px] font-medium text-[#6B6B6B] mt-0.5">
          {subtext}
        </div>
      )}
    </Component>
  );
};
