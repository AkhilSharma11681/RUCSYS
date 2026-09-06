'use client';

import React from 'react';
import Image from 'next/image';
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
      <div className="flex items-center justify-center">
        <Image
          src="/ru-logo.png"
          alt="Rishihood University Logo"
          width={108}
          height={40}
          className="h-9 w-auto object-contain"
          priority
        />
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
