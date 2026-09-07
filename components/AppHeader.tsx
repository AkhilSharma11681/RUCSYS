'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Menu,
  Bell,
  X,
  LogOut,
  Package,
  Shield,
  HelpCircle,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface AppHeaderProps {
  unreadCount?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  unreadCount: initialUnreadCount = 3,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Dynamic sample notifications
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Package Arrived at Gate 2',
      description: 'Your package from Amazon is ready for collection at Shelf A-3.',
      time: '10m ago',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'Store Room Capacity Alert',
      description: 'Storage capacity has reached 75%. Pick up your pending parcels promptly.',
      time: '1h ago',
      type: 'warning',
      read: false,
    },
    {
      id: '3',
      title: 'System Notice: Gate 2 Timings',
      description: 'The parcel counter is open daily from 8:00 AM to 10:00 PM.',
      time: '5h ago',
      type: 'info',
      read: false,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-[#FBF6F1] border-b border-[#E8E0D8]/60 px-4 flex items-center justify-between">
        {/* Left Hamburger */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-[#1a1a1a] hover:bg-[#F5EDE6] rounded-xl transition-colors active:scale-95"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6 stroke-[1.75]" />
        </button>

        {/* Center Logo & Wordmark */}
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/ru-logo.png"
            alt="Rishihood University Logo"
            width={108}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Right Bell with Badge */}
        <button
          type="button"
          onClick={() => setIsNotifOpen(true)}
          className="relative p-2 text-[#1a1a1a] hover:bg-[#F5EDE6] rounded-xl transition-colors active:scale-95"
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

      {/* Slide-over Left Navigation & Account Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Side Drawer */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E8E0D8] bg-[#FBF6F1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4572E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    RU
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1a1a1a] text-sm leading-tight">RUCSYS Gate No. 2</h2>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">Campus Parcel Management</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-[#6B6B6B] hover:text-[#1a1a1a] bg-white rounded-full border border-[#E8E0D8] shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation & Information Links */}
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9A9A] px-3 mb-2">
                    Gate Desk Info
                  </p>
                  <div className="bg-[#FAF8F5] border border-[#E8E0D8]/80 rounded-xl p-3.5 space-y-2.5 text-xs text-[#1a1a1a]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#E4572E] shrink-0" />
                      <div>
                        <p className="font-semibold">Counter Timings</p>
                        <p className="text-[#6B6B6B] text-[11px]">8:00 AM – 10:00 PM Daily</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                      <div>
                        <p className="font-semibold">Guard Desk Intercom</p>
                        <p className="text-[#6B6B6B] text-[11px]">Ext. 1024 / Gate 2</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9A9A] px-3 mb-2">
                    Help & Guidelines
                  </p>
                  <div className="bg-[#FAF8F5] border border-[#E8E0D8]/80 rounded-xl p-3 text-xs space-y-2 text-[#6B6B6B]">
                    <p className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#E4572E] shrink-0 mt-0.5" />
                      <span>Pre-register deliveries before courier arrival to receive instant 4-digit collection OTPs.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                      <span>Delegates can collect on your behalf using your secret 4-digit code.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-[#E8E0D8] bg-[#FAF8F5]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-[#FDECEA] text-[#C0392B] border border-[#FADBD8] rounded-xl font-bold text-xs transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of RUCSYS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Right Notifications Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNotifOpen(false)}
          />

          {/* Notification Sheet */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-[#E8E0D8] bg-[#FBF6F1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#E4572E]" />
                  <h2 className="font-bold text-[#1a1a1a] text-base">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-[#E4572E] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#1a1a1a] bg-white rounded-full border border-[#E8E0D8] shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Actions Bar */}
              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#E8E0D8]/60 flex justify-end">
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-[#E4572E] hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="divide-y divide-[#E8E0D8]/60 overflow-y-auto max-h-[calc(100vh-140px)]">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 transition-colors ${
                      item.read ? 'bg-white opacity-70' : 'bg-[#FFF9F5]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.type === 'success' && (
                          <div className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2E7D4F] flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === 'warning' && (
                          <div className="w-6 h-6 rounded-full bg-[#FDECEA] text-[#C0392B] flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === 'info' && (
                          <div className="w-6 h-6 rounded-full bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#1a1a1a] truncate">{item.title}</h4>
                          <span className="text-[10px] text-[#9A9A9A] shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E8E0D8] bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                className="w-full py-2.5 bg-white hover:bg-[#F3EDE6] border border-[#E8E0D8] text-[#1a1a1a] font-bold text-xs rounded-xl transition-colors shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};