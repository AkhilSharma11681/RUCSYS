'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, PlusCircle, History, LayoutGrid, PackagePlus, Inbox, AlertCircle } from 'lucide-react';

interface BottomTabBarProps {
  app: 'learner' | 'guard';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ app }) => {
  const pathname = usePathname();

  const learnerTabs = [
    { label: 'Parcels', href: '/parcels', icon: Package },
    { label: 'Register', href: '/parcels/register', icon: PlusCircle },
    { label: 'History', href: '/parcels/history', icon: History },
  ];

  const guardTabs = [
    { label: 'Dashboard', href: '/guard', icon: LayoutGrid },
    { label: 'Arrived', href: '/guard/arrived', icon: PackagePlus },
    { label: 'Unregistered', href: '/guard/unregistered', icon: Inbox },
    { label: 'Overdue', href: '/guard/overdue', icon: AlertCircle },
  ];

  const tabs = app === 'learner' ? learnerTabs : guardTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E0D8] px-2 py-1.5 flex justify-around items-center max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#E4572E] font-semibold scale-105'
                : 'text-[#6B6B6B] hover:text-[#1a1a1a]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
