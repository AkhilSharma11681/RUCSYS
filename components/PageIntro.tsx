'use client';

import React from 'react';

interface PageIntroProps {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const PageIntro: React.FC<PageIntroProps> = ({
  title,
  subtitle,
  badge,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`flex items-start justify-between mb-5 ${
        align === 'center' ? 'text-center flex-col items-center' : ''
      } ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-serif text-[#1a1a1a] tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-sm">
          {subtitle}
        </p>
      </div>
      {badge && <div className="ml-3 shrink-0">{badge}</div>}
    </div>
  );
};
