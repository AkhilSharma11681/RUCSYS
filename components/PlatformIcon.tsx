'use client';

import React from 'react';
import { Platform } from '@/lib/types';
import { Package } from 'lucide-react';

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
  const p = String(platform).toLowerCase().replace(/\s+/g, '');

  const dimensions =
    size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  const iconSizes =
    size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  switch (p) {
    case 'amazon':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Amazon"
        >
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Amazon 'a' */}
            <text x="5" y="14" fill="#111111" fontSize="13" fontWeight="900" fontFamily="sans-serif">
              a
            </text>
            {/* Amazon smile arrow */}
            <path
              d="M4 16.5C7.5 19.5 13.5 19.5 17 16"
              stroke="#FF9900"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M15.5 15.2L17.5 16.2L16.2 18"
              stroke="#FF9900"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    case 'flipkart':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Flipkart"
        >
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Yellow shopping bag */}
            <path
              d="M6 7H18L16.5 19H7.5L6 7Z"
              fill="#FFE11B"
            />
            <path
              d="M9 7V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7"
              stroke="#2874F0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M10 11H14M10 14H13"
              stroke="#2874F0"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'myntra':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Myntra"
        >
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 16C4 12 6.5 8 8.5 8C10 8 10.8 10 11 12C11.2 10 12 8 13.5 8C15.5 8 18 12 18 16C18 16.5 16.5 17 15.5 15C14.5 13 13.5 10.5 12.8 10.5C12.2 10.5 11.8 12.5 11 15C10.2 12.5 9.8 10.5 9.2 10.5C8.5 10.5 7.5 13 6.5 15C5.5 17 4 16.5 4 16Z"
              fill="#FF3F6C"
            />
            <path
              d="M8.5 8C7 8 5 12 4 16C4.5 16.5 5.8 16.8 6.5 15C7.5 13 8.5 10.5 9.2 10.5C9.5 10.5 9.8 11 10.2 12C9.5 10 9.2 8 8.5 8Z"
              fill="#F47B20"
            />
            <path
              d="M13.5 8C15 8 17 12 18 16C17.5 16.5 16.2 16.8 15.5 15C14.5 13 13.5 10.5 12.8 10.5C12.5 10.5 12.2 11 11.8 12C12.5 10 12.8 8 13.5 8Z"
              fill="#E42575"
            />
          </svg>
        </div>
      );

    case 'zepto':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Zepto"
        >
          <span className="font-black text-base tracking-tighter text-[#52057B] font-sans">
            z<span className="text-[#FF3269]">!</span>
          </span>
        </div>
      );

    case 'meesho':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Meesho"
        >
          <span className="font-black text-base font-sans tracking-tight text-[#F43397]">
            m
          </span>
        </div>
      );

    case 'blinkit':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Blinkit"
        >
          <span className="font-black text-base font-sans tracking-tight text-[#0C831F]">
            b
          </span>
        </div>
      );

    case 'bluedart':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Blue Dart"
        >
          <span className="font-black text-[11px] text-[#003399] tracking-tighter">
            BLUE<span className="text-[#E31837]">D</span>
          </span>
        </div>
      );

    case 'delhivery':
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 ${className}`}
          title="Delhivery"
        >
          <span className="font-black text-xs text-[#E31837] tracking-tight">
            DLV
          </span>
        </div>
      );

    default:
      return (
        <div
          className={`${dimensions} flex items-center justify-center shrink-0 text-[#6B6B6B] ${className}`}
          title={platform}
        >
          <Package className={iconSizes} />
        </div>
      );
  }
};
