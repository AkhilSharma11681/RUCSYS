'use client';

import React from 'react';
import { StatTile } from '@/components/StatTile';
import { Package, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface AdminKpiCardsProps {
  parcelsThisMonth: {
    current: number;
    deltaStr: string;
  };
  avgDwellTime: {
    current: number;
    deltaStr: string;
  };
  overdueRate: {
    current: number;
  };
  peakPlatform: {
    platform: string;
    count: number;
  };
}

export function AdminKpiCards({
  parcelsThisMonth,
  avgDwellTime,
  overdueRate,
  peakPlatform,
}: AdminKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatTile
        label="This Month"
        value={parcelsThisMonth.current}
        subtext={parcelsThisMonth.deltaStr}
        icon={Package}
      />
      <StatTile
        label="Avg Dwell Time"
        value={`${avgDwellTime.current}d`}
        subtext={avgDwellTime.deltaStr}
        icon={Clock}
      />
      <StatTile
        label="Overdue Rate"
        value={`${overdueRate.current}%`}
        subtext="Active parcels only"
        icon={AlertTriangle}
      />
      <StatTile
        label="Peak Platform"
        value={peakPlatform.platform}
        subtext={`${peakPlatform.count} orders`}
        icon={TrendingUp}
      />
    </div>
  );
}
