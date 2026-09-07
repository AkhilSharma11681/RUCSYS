import React from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF6F1] flex flex-col justify-between">
      <div>
        <AppHeader app="learner" unreadCount={2} />
        <main className="max-w-6xl xl:max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12">
          {children}
        </main>
      </div>
      <BottomTabBar app="learner" />
    </div>
  );
}
