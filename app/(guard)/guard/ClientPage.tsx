'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { CapacityCallout } from '@/components/CapacityCallout';
import { StatTile } from '@/components/StatTile';
import { StatusPill } from '@/components/StatusPill';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PrimaryButton } from '@/components/Buttons';
import { Clock, Archive, CheckCircle2, AlertTriangle, Search, X, Loader2 } from 'lucide-react';
import { searchPendingAction } from './actions';
import { CollectionType } from '@/lib/types';

interface PendingRequest {
  id: string;
  platform: string;
  orderLast4: string;
  collectionType: CollectionType;
  expectedDate: string;
  studentName: string;
}

interface SummaryRequest {
  id: string;
  platform: string;
  orderLast4: string;
  studentName: string;
}

interface GuardDashboardClientProps {
  capacity: { active: number; max: number };
  stats: {
    pending: number;
    stored: number;
    readyForPickup: number;
    overdue: number;
  };
  initialPending: PendingRequest[];
  readySummary: SummaryRequest[];
  overdueSummary: SummaryRequest[];
}

export function GuardDashboardClient({
  capacity,
  stats,
  initialPending,
  readySummary,
  overdueSummary,
}: GuardDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pendingList, setPendingList] = useState<PendingRequest[]>(initialPending);
  const [isPendingSearch, startTransition] = useTransition();
  const [highlightPending, setHighlightPending] = useState(false);

  // Debounce search input (~400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch results when debounced query changes
  useEffect(() => {
    startTransition(() => {
      searchPendingAction(debouncedQuery)
        .then((results) => {
          setPendingList(results as PendingRequest[]);
        })
        .catch((err) => {
          console.error('Failed to search pending requests:', err);
        });
    });
  }, [debouncedQuery]);

  const handlePendingTileClick = () => {
    setHighlightPending(true);
    const element = document.getElementById('pending-arrivals-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      setHighlightPending(false);
    }, 1500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">Welcome, Gate No. 2</h1>
        <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
          Manage package arrivals, storage, and pick-ups.
        </p>
      </div>

      <CapacityCallout
        currentPackages={capacity.active}
        maxPackages={capacity.max}
        label="Store Room Capacity"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile
          label="Pending Arrivals"
          value={stats.pending}
          icon={Clock}
          interactive={true}
          isActive={highlightPending}
          onClick={handlePendingTileClick}
        />
        <StatTile
          label="Stored"
          value={stats.stored}
          icon={Archive}
          interactive={false}
        />
        <StatTile
          label="Ready for Pickup"
          value={stats.readyForPickup}
          icon={CheckCircle2}
          interactive={false}
        />
        <StatTile
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          interactive={false}
        />
      </div>

      <div
        id="pending-arrivals-section"
        className={`transition-all duration-300 rounded-2xl p-1 -m-1 ${
          highlightPending ? 'bg-[#FFF6F0] ring-2 ring-[#E4572E]' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] tracking-tight">Pending Arrivals</h2>
          <span className="text-[12px] font-bold text-[#E4572E] bg-[#FFF6F0] border border-[#FEE4D6] px-2.5 py-0.5 rounded-full">
            {stats.pending} Expected
          </span>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {isPendingSearch ? (
              <Loader2 className="w-4 h-4 text-[#E4572E] animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-[#6B6B6B]" />
            )}
          </div>
          <input
            type="text"
            className="w-full bg-white border border-[#E8E0D8] text-[#1a1a1a] text-[14px] rounded-xl pl-10 pr-10 py-3 outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E] transition-all shadow-sm placeholder:text-[#9A9A9A]"
            placeholder="Search by student, order ID, or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4 text-[#6B6B6B] hover:text-[#1a1a1a]" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {pendingList.length === 0 ? (
            <div className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-[#F5EDE6] rounded-full flex items-center justify-center mb-2">
                <Search className="w-5 h-5 text-[#6B6B6B]" />
              </div>
              <p className="text-[#1a1a1a] font-bold text-[15px] mb-1">No pending arrivals found</p>
              <p className="text-[#6B6B6B] text-[13px]">
                {debouncedQuery
                  ? `No packages matching "${debouncedQuery}"`
                  : 'There are no pending parcel requests right now.'}
              </p>
            </div>
          ) : (
            pendingList.map((req) => (
              <div key={req.id} className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <PlatformIcon platform={req.platform} size="md" className="rounded-xl bg-[#FBF6F1] p-1 border border-[#E8E0D8]/60 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#1a1a1a] text-[15px] truncate">
                        {req.studentName}
                      </h3>
                      <StatusPill status={req.collectionType} size="sm" />
                    </div>
                    <div className="text-[13px] text-[#6B6B6B] flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="font-medium text-[#1a1a1a]">{req.platform}</span>
                      <span className="w-1 h-1 bg-[#D1C8C0] rounded-full"></span>
                      <span>Order ...{req.orderLast4}</span>
                      <span className="w-1 h-1 bg-[#D1C8C0] rounded-full"></span>
                      <span>Exp: {formatDate(req.expectedDate)}</span>
                    </div>

                    <div className="pt-1">
                      <Link href={`/guard/arrivals/${req.id}`} className="block">
                        <PrimaryButton
                          fullWidth
                          className="!h-10 text-[14px] !rounded-xl"
                        >
                          Mark Arrived
                        </PrimaryButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#1a1a1a] tracking-tight">Ready for Pickup</h2>
          <Link href="/guard/arrived" className="text-[13px] font-bold text-[#E4572E] hover:underline">
            View All →
          </Link>
        </div>
        <div className="space-y-2.5">
          {readySummary.length === 0 ? (
            <div className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-5 text-center">
              <p className="text-[13px] text-[#6B6B6B] font-medium">No parcels waiting for pickup</p>
            </div>
          ) : (
            readySummary.map((item) => (
              <div key={item.id} className="bg-white border border-[#E8E0D8]/80 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
                <PlatformIcon platform={item.platform} size="sm" className="rounded-lg bg-[#FBF6F1] p-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a1a1a] text-[14px] truncate">{item.studentName}</p>
                  <p className="text-[12px] text-[#6B6B6B] truncate">{item.platform} &middot; Order ...{item.orderLast4}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2">
            Overdue Parcels
            {stats.overdue > 0 && (
              <span className="text-[11px] font-bold text-white bg-[#C0392B] px-2 py-0.5 rounded-full">
                {stats.overdue}
              </span>
            )}
          </h2>
          <Link href="/guard/overdue" className="text-[13px] font-bold text-[#6B6B6B] hover:text-[#1a1a1a]">
            View All →
          </Link>
        </div>
        <div className="space-y-2.5">
          {overdueSummary.length === 0 ? (
            <div className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-5 text-center">
              <p className="text-[13px] text-[#6B6B6B] font-medium">No overdue parcels</p>
            </div>
          ) : (
            overdueSummary.map((item) => (
              <div key={item.id} className="bg-[#FDECEA]/30 border border-[#FADBD8] rounded-xl p-3.5 flex items-center gap-3">
                <PlatformIcon platform={item.platform} size="sm" className="rounded-lg bg-white p-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#C0392B] text-[14px] truncate">{item.studentName}</p>
                  <p className="text-[12px] text-[#C0392B]/80 truncate">{item.platform} &middot; Order ...{item.orderLast4}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
