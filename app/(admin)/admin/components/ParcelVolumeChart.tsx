'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { DetailCard } from '@/components/DetailCard';

interface ParcelVolumeChartProps {
  data: Array<{ date: string; count: number }>;
}

export function ParcelVolumeChart({ data }: ParcelVolumeChartProps) {
  // Format dates for the X-axis (e.g., 'Sep 01')
  const formattedData = data.map((item) => {
    const d = new Date(item.date);
    return {
      ...item,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    };
  });

  return (
    <DetailCard>
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-[#1a1a1a]">Arrival Volume (Last 14 Days)</h2>
        <p className="text-xs text-[#6B6B6B] mt-1">Daily parcel arrivals at the gate</p>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E0D8" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6B6B6B', fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6B6B6B', fontWeight: 500 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#F5EDE6' }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #E8E0D8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                padding: '8px 12px',
              }}
              labelStyle={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}
              itemStyle={{ fontSize: '13px', fontWeight: 700, color: '#E4572E' }}
              formatter={(value?: any) => [`${value ?? 0} parcels`, 'Volume']}
            />
            <Bar
              dataKey="count"
              fill="#E4572E"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DetailCard>
  );
}
