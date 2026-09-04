import React from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function GuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF6F1] flex flex-col justify-between max-w-md mx-auto relative border-x border-[#E8E0D8]/40 shadow-sm">
      <div>
        <AppHeader unreadCount={5} />
        <main className="p-4 pb-24">{children}</main>
      </div>
      <BottomTabBar app="guard" />
    </div>
  );
}
