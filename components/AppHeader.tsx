'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface AppHeaderProps {
  unreadCount?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  unreadCount = 3,
  onMenuClick,
  onNotificationClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#FBF6F1] border-b border-[#E8E0D8]/60 px-4 flex items-center justify-between">
      {/* Left Hamburger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 text-[#1a1a1a] hover:bg-[#F5EDE6] rounded-xl transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6 stroke-[1.75]" />
      </button>

      {/* Center Logo & Wordmark */}
      <div className="flex items-center space-x-2">
        {/* Shield Crest Icon */}
        <div className="w-7 h-8 text-[#E4572E] flex items-center justify-center">
          <svg viewBox="0 0 24 28" fill="none" className="w-full h-full">
            <path
              d="M12 0L0 5V13.5C0 21.2 5.1 26.2 12 28C18.9 26.2 24 21.2 24 13.5V5L12 0Z"
              fill="#E4572E"
            />
            <path
              d="M8.5 7.5C8.5 7.5 10 6 12 6C14.5 6 16 8 15 11.5C14 15 11 17 9.5 21"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-lg font-bold text-[#1a1a1a] tracking-tight lowercase">
            rishihood
          </span>
          <span className="text-[10px] font-sans text-[#1a1a1a] tracking-wider uppercase font-semibold -mt-1">
            university
          </span>
        </div>
      </div>

      {/* Right Bell with Badge */}
      <button
        type="button"
        onClick={onNotificationClick}
        className="relative p-2 text-[#1a1a1a] hover:bg-[#F5EDE6] rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 stroke-[1.75]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E4572E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  );
};
