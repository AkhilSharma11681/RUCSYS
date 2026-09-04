'use client';

import React from 'react';
import { RequestStatus, CollectionType } from '@/lib/types';

interface StatusPillProps {
  status?: RequestStatus | 'overdue' | CollectionType | string;
  variant?: 'outline' | 'fill';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status = 'pending',
  variant = 'fill',
  className = '',
  size = 'sm',
}) => {
  // Normalize string for safety
  const s = String(status).toLowerCase();

  let colorClasses = 'bg-[#F5EDE6] text-[#6B6B6B] border-[#E8E0D8]/40'; // Default gray
  let label = status;

  if (s === 'pending') {
    colorClasses = 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]';
    label = 'Pending';
  } else if (s === 'arrived' || s === 'ready_for_pickup') {
    colorClasses = 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]';
    label = s === 'arrived' ? 'Arrived' : 'Ready for Pickup';
  } else if (s === 'collected') {
    colorClasses = 'bg-[#E8F5E9] text-[#2E7D4F] border-[#C8E6C9]';
    label = 'Collected';
  } else if (s === 'overdue' || s === 'cancelled') {
    colorClasses = 'bg-[#FDECEA] text-[#C0392B] border-[#FADBD8]';
    label = s === 'overdue' ? 'Overdue' : 'Cancelled';
  } else if (s === 'immediate') {
    colorClasses = 'bg-[#FDECEA] text-[#C0392B] border-[#FADBD8]';
    label = 'Immediate Pickup';
  } else if (s === 'can_be_stored') {
    colorClasses = 'bg-[#F5EDE6] text-[#6B6B6B] border-[#E8E0D8]/40';
    label = 'Storage OK';
  }

  const baseClasses = `inline-flex items-center justify-center font-medium rounded-full ${
    variant === 'outline' ? 'bg-transparent border border-current' : 'border border-transparent'
  } ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs'}`;

  return (
    <span className={`${baseClasses} ${variant === 'fill' ? colorClasses : ''} ${className}`}>
      {String(label)}
    </span>
  );
};
