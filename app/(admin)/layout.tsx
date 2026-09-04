import React from 'react';
import { AppHeader } from '@/components/AppHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF6F1] flex flex-col justify-between max-w-4xl mx-auto relative border-x border-[#E8E0D8]/40 shadow-sm">
      <div>
        <AppHeader unreadCount={0} />
        <main className="p-4 sm:p-6 pb-12">{children}</main>
      </div>
    </div>
  );
}
