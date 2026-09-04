import React from 'react';
import { Platform } from '@/lib/types';
import { ShoppingBag, Truck, Package } from 'lucide-react';

interface PlatformIconProps {
  platform: Platform | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 'md',
  className = '',
}) => {
  const p = String(platform).toLowerCase();

  const dimensions =
    size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';

  // Config mapping for specific colors & labels
  let bgClass = 'bg-[#F5EDE6] text-[#1a1a1a]';
  let label = p.charAt(0).toUpperCase();

  if (p === 'amazon') {
    bgClass = 'bg-[#FF9900]/15 text-[#D47A00] border-[#FF9900]/30';
    label = 'A';
  } else if (p === 'flipkart') {
    bgClass = 'bg-[#2874F0]/15 text-[#2874F0] border-[#2874F0]/30';
    label = 'F';
  } else if (p === 'myntra') {
    bgClass = 'bg-[#E42575]/15 text-[#E42575] border-[#E42575]/30';
    label = 'M';
  } else if (p === 'meesho') {
    bgClass = 'bg-[#5B21B6]/15 text-[#5B21B6] border-[#5B21B6]/30';
    label = 'M';
  } else if (p === 'zepto') {
    bgClass = 'bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30';
    label = 'Z';
  } else if (p === 'blinkit') {
    bgClass = 'bg-[#FACC15]/20 text-[#854D0E] border-[#FACC15]/40';
    label = 'B';
  } else if (p === 'bluedart' || p === 'delhivery') {
    bgClass = 'bg-[#0284C7]/15 text-[#0284C7] border-[#0284C7]/30';
    label = p === 'bluedart' ? 'BD' : 'D';
  }

  return (
    <div
      className={`${dimensions} rounded-xl border flex items-center justify-center font-bold tracking-tight shrink-0 ${bgClass} ${className}`}
      title={platform}
    >
      {label.length > 1 ? (
        <span className="text-[10px] font-bold">{label}</span>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
};
