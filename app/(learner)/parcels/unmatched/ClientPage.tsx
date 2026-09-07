'use client';

import React, { useState } from 'react';
import { DetailCard } from '@/components/DetailCard';
import { PlatformIcon } from '@/components/PlatformIcon';
import { Search, Info, MapPin, CheckCircle2, ChevronLeft, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { PrimaryButton } from '@/components/Buttons';
import { Platform } from '@/lib/types';

interface UnregisteredParcelItem {
  id: string;
  parcelNumber: number;
  platform: string;
  orderId: string;
  arrivedAt: string;
}

interface UnmatchedSearchClientPageProps {
  initialParcels: UnregisteredParcelItem[];
}

const PLATFORM_OPTIONS = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Meesho',
  'Zepto',
  'Blinkit',
  'BlueDart',
  'Delhivery',
  'Other',
];

export function UnmatchedSearchClientPage({ initialParcels }: UnmatchedSearchClientPageProps) {
  const [platform, setPlatform] = useState('');
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const filteredParcels = initialParcels.filter(p => {
    let match = true;
    if (platform && p.platform.toLowerCase() !== platform.toLowerCase() && platform !== 'Other') {
      match = false;
    }
    if (orderIdSearch) {
      if (!p.orderId.toLowerCase().includes(orderIdSearch.toLowerCase())) {
        match = false;
      }
    }
    return match;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1] pb-24 pt-6 space-y-6">
      <div className="mb-6 flex items-center space-x-3">
        <Link href="/parcels" className="p-2 bg-white rounded-full border border-[#E8E0D8] text-[#1a1a1a] hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight mb-0.5">
            Find Unmatched Parcel
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Search items delivered without pre-registration.
          </p>
        </div>
      </div>

      <DetailCard className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
            >
              <option value="">Any Platform</option>
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              Order ID / Tracking Number
            </label>
            <input
              type="text"
              value={orderIdSearch}
              onChange={(e) => setOrderIdSearch(e.target.value)}
              placeholder="e.g. 402-9182391 or last 4 digits"
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
            />
          </div>

          <PrimaryButton type="submit" fullWidth className="!h-12">
            <span className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search Parcels
            </span>
          </PrimaryButton>
        </form>
      </DetailCard>

      {hasSearched && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">
            Search Results ({filteredParcels.length})
          </h2>

          {filteredParcels.length === 0 ? (
            <DetailCard className="text-center py-8 bg-white">
              <PackageSearch className="w-10 h-10 mx-auto text-[#E8E0D8] mb-3" />
              <p className="text-sm font-bold text-[#1a1a1a]">No matching parcels found</p>
              <p className="text-[13px] text-[#6B6B6B] mt-1 max-w-[250px] mx-auto">
                We couldn't find an unregistered parcel matching these details. It may not have arrived yet.
              </p>
            </DetailCard>
          ) : (
            <>
              {filteredParcels.map((parcel) => (
                <DetailCard key={parcel.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <PlatformIcon
                        platform={parcel.platform}
                        size="md"
                        className="rounded-xl bg-[#FBF6F1] p-1 border border-[#E8E0D8]/60 mt-0.5 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-[#1a1a1a] text-[15px]">{parcel.platform}</h3>
                        <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                          Arrived: {new Date(parcel.arrivedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-0.5">Parcel #</span>
                      <span className="text-[16px] font-black text-[#E4572E]">{parcel.parcelNumber}</span>
                    </div>
                  </div>

                  <div className="bg-[#FFF5F0] border border-[#FCDDC9]/60 rounded-xl p-3 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] text-[#1a1a1a] font-semibold mb-0.5">Is this yours?</p>
                      <p className="text-[12px] text-[#E4572E]/80 leading-relaxed">
                        Go to Gate No. 2, present your student ID, and ask the guard to link Parcel #{parcel.parcelNumber} to your account.
                      </p>
                    </div>
                  </div>
                </DetailCard>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
