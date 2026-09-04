'use client';

import React from 'react';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CapacityCalloutProps {
  currentPackages: number;
  maxPackages?: number;
  href?: string;
  className?: string;
}

export const CapacityCallout: React.FC<CapacityCalloutProps> = ({
  currentPackages,
  maxPackages = 100, // By default 100 per specs
  href = '/guard',
  className = '',
}) => {
  const percentage = Math.min(100, Math.round((currentPackages / maxPackages) * 100));
  const isFull = percentage >= 100;
  const isWarning = percentage >= 85 && percentage < 100;

  let bgClass = 'bg-[#FFF3E0] border-[#FFE0B2]';
  let emptyProgressClass = 'bg-[#FFE0B2]/50';
  let fillProgressClass = 'bg-[#E65100]';
  let textClass = 'text-[#E65100]';

  if (isFull) {
    bgClass = 'bg-[#FDECEA] border-[#FADBD8]';
    emptyProgressClass = 'bg-[#FADBD8]/50';
    fillProgressClass = 'bg-[#C0392B]';
    textClass = 'text-[#C0392B]';
  } else if (isWarning) {
    bgClass = 'bg-[#FFF9C4] border-[#FFF59D]';
    emptyProgressClass = 'bg-[#FFF59D]/70';
    fillProgressClass = 'bg-[#F57F17]';
    textClass = 'text-[#F57F17]';
  }

  return (
    <div className={`rounded-xl border p-4 flex flex-col space-y-3 ${bgClass} ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 ${textClass}`}>
          <Package className="w-5 h-5 stroke-[2]" />
          <span className="font-semibold text-sm">Shelf Capacity</span>
        </div>
        {!isFull ? (
          <span className={`text-xs font-bold ${textClass}`}>
            {currentPackages} / {maxPackages}
          </span>
        ) : (
          <span className={`text-xs font-bold ${textClass}`}>FULL</span>
        )}
      </div>

      <div className={`w-full h-1.5 rounded-full ${emptyProgressClass} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${fillProgressClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {href && (
        <Link
          href={href}
          className={`inline-flex items-center text-xs font-bold ${textClass} hover:opacity-80 mt-1`}
        >
          View Shelf <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      )}
    </div>
  );
};
