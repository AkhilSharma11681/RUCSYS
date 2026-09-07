'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { searchAwaitingCollectionAction } from './actions';
import { Search, Loader2 } from 'lucide-react';

interface AwaitingParcel {
  id: string;
  parcelNumber: number;
  storageLocation: string | null;
  isUnregistered: boolean;
  arrivedAt: string | null;
  otpAttempts: number;
  platform: string | null;
  orderLast4: string | null;
  collectionType: string | null;
  status: string | null;
  studentName: string;
}

export function CollectSearchPlaceholder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AwaitingParcel[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    startTransition(async () => {
      try {
        const data = await searchAwaitingCollectionAction(searchQuery);
        setResults(data as AwaitingParcel[]);
      } catch (err) {
        console.error('Search failed:', err);
      }
    });
  };

  useEffect(() => {
    // Initial fetch of uncollected parcels
    handleSearch('');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Collect Parcel (Verify Code)</h1>
        <p className="text-sm text-[#6B6B6B]">Search awaiting parcels by parcel number, order ID, or student name.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-[#E4572E] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-[#6B6B6B]" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by parcel #, order last 4, or name..."
          className="w-full bg-white border border-[#E8E0D8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E4572E]"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#6B6B6B]">Results ({results.length})</h2>
        {results.length === 0 ? (
          <p className="text-sm text-[#6B6B6B]">No parcels found awaiting collection.</p>
        ) : (
          <ul className="divide-y divide-[#E8E0D8] bg-white rounded-xl border border-[#E8E0D8] overflow-hidden">
            {results.map((parcel) => (
              <li key={parcel.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1a1a1a]">
                    Parcel #{parcel.parcelNumber} &middot; {parcel.studentName}
                  </div>
                  <div className="text-xs text-[#6B6B6B]">
                    {parcel.platform} &middot; Order ...{parcel.orderLast4} &middot; Location: {parcel.storageLocation || 'N/A'}
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFF6F0] text-[#E4572E] font-medium border border-[#FEE4D6]">
                  {parcel.status || 'arrived'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
