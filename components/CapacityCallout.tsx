'use client';

import React from 'react';
import { Info, Clock } from 'lucide-react';

interface CapacityCalloutProps {
  currentPackages: number;
  maxPackages?: number;
  label?: string;
  className?: string;
  icon?: 'info' | 'clock';
}

export const CapacityCallout: React.FC<CapacityCalloutProps> = ({
  currentPackages,
  maxPackages = 100,
  label = 'Store Room Capacity',
  className = '',
  icon = 'info',
}) => {
  return (
    <div
      className={`rounded-2xl bg-[#FFF6F0] border border-[#FEE4D6]/70 p-4 sm:p-4.5 flex items-start space-x-3.5 shadow-sm ${className}`}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#E4572E] flex items-center justify-center shrink-0 text-[#E4572E] mt-0.5">
        {icon === 'clock' ? (
          <Clock className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <Info className="w-4 h-4 stroke-[2.5]" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-[#1a1a1a] text-[15px] leading-tight mb-1">
          {label}
        </h4>
        <p className="text-[13px] text-[#6B6B6B] font-medium leading-snug">
          Currently {currentPackages}/{maxPackages} parcels stored
        </p>
        <p className="text-[13px] text-[#6B6B6B] font-medium leading-snug">
          We will notify you if the space gets full.
        </p>
      </div>
    </div>
  );
};
