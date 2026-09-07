'use client';

import React, { useState, useTransition } from 'react';
import { logCallAction } from './actions';
import { PlatformIcon } from '@/components/PlatformIcon';
import { DetailCard } from '@/components/DetailCard';
import { AlertCircle, Phone, PhoneCall, CheckCircle2, Search, X, Loader2, MapPin, Eye } from 'lucide-react';
import { EscalationStage } from '@/lib/types';
import { ParcelDetailModal } from '@/components/ParcelDetailModal';

export interface OverdueParcelItem {
  id: string;
  parcelNumber: number;
  storageLocation: string | null;
  arrivedAt: string;
  platform: string;
  orderLast4: string;
  studentName: string;
  daysOverdue: number;
  stages: EscalationStage[];
}

interface OverdueParcelsClientProps {
  initialParcels: OverdueParcelItem[];
  notifyThresholdDays: number;
}

export function OverdueParcelsClient({
  initialParcels,
  notifyThresholdDays,
}: OverdueParcelsClientProps) {
  const [parcelsList, setParcelsList] = useState<OverdueParcelItem[]>(initialParcels);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingParcelId, setLoadingParcelId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDetailParcel, setSelectedDetailParcel] = useState<any | null>(null);

  const filteredParcels = parcelsList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.studentName.toLowerCase().includes(q) ||
      p.platform.toLowerCase().includes(q) ||
      p.orderLast4.toLowerCase().includes(q) ||
      p.parcelNumber.toString().includes(q) ||
      (p.storageLocation && p.storageLocation.toLowerCase().includes(q))
    );
  });

  const handleLogCall = (parcelId: string, studentName: string) => {
    const confirmCall = window.confirm(
      `Confirm logging manual telephone follow-up for "${studentName}"?`
    );
    if (!confirmCall) return;

    setLoadingParcelId(parcelId);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await logCallAction(parcelId);
      if (res.success) {
        setParcelsList((prev) =>
          prev.map((p) => {
            if (p.id === parcelId) {
              const updatedStages = p.stages.includes(EscalationStage.CALL)
                ? p.stages
                : [...p.stages, EscalationStage.CALL];
              return { ...p, stages: updatedStages };
            }
            return p;
          })
        );
      } else {
        setErrorMessage(res.error || 'Failed to log call.');
      }
      setLoadingParcelId(null);
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight">Overdue Parcels</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">
          Parcels stored for {notifyThresholdDays}+ days awaiting pickup. Follow up with students to clear storage space.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-[#FDECEA] border border-[#FADBD8] rounded-xl flex items-center space-x-3 text-[#C0392B]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#6B6B6B]" />
        </div>
        <input
          type="text"
          className="w-full bg-white border border-[#E8E0D8] text-[#1a1a1a] text-[14px] rounded-xl pl-10 pr-10 py-3 outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E] transition-all shadow-sm placeholder:text-[#9A9A9A]"
          placeholder="Search by student, parcel #, order ID, or shelf..."
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

      {/* Parcels List */}
      <div className="space-y-3">
        {filteredParcels.length === 0 ? (
          <DetailCard className="text-center py-10 bg-white">
            <AlertCircle className="w-10 h-10 mx-auto text-[#C8E6C9] text-[#2E7D4F] mb-3" />
            <p className="text-sm font-bold text-[#1a1a1a]">
              {searchQuery ? 'No matching overdue parcels' : 'No overdue parcels'}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">
              {searchQuery
                ? `No parcels matched "${searchQuery}".`
                : 'All stored parcels are currently within regular pickup timelines.'}
            </p>
          </DetailCard>
        ) : (
          filteredParcels.map((parcel) => {
            const hasCallLogged = parcel.stages.includes(EscalationStage.CALL);
            const isCallingThis = isPending && loadingParcelId === parcel.id;

            return (
              <div
                key={parcel.id}
                onClick={() => setSelectedDetailParcel({
                  id: parcel.id,
                  parcelNumber: parcel.parcelNumber,
                  studentName: parcel.studentName,
                  platform: parcel.platform,
                  orderLast4: parcel.orderLast4,
                  storageLocation: parcel.storageLocation,
                  arrivedAt: parcel.arrivedAt,
                  status: 'overdue',
                  notes: `${parcel.daysOverdue} days overdue. Escalation stage: ${parcel.stages.join(', ') || 'Pending'}`
                })}
                className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer hover:border-[#E4572E]/50 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <PlatformIcon
                      platform={parcel.platform}
                      size="md"
                      className="rounded-xl bg-[#FBF6F1] p-1 border border-[#E8E0D8]/60 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#1a1a1a] text-[15px] truncate">
                          {parcel.studentName}
                        </h3>
                      </div>
                      <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                        {parcel.platform} &middot; Order ...{parcel.orderLast4}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#FDECEA] text-[#C0392B] border border-[#FADBD8]">
                      {parcel.daysOverdue} {parcel.daysOverdue === 1 ? 'day' : 'days'} overdue
                    </span>
                    <p className="text-[13px] font-bold text-[#1a1a1a] mt-1">
                      Parcel #{parcel.parcelNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D8]/60 text-xs text-[#6B6B6B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E4572E]" />
                    <span className="font-medium text-[#1a1a1a]">
                      {parcel.storageLocation || 'Unassigned Shelf'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasCallLogged ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D4F] bg-[#E8F5E9] px-2 py-1 rounded-lg border border-[#C8E6C9]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Call Logged
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogCall(parcel.id, parcel.studentName);
                        }}
                        disabled={isCallingThis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold text-[#C0392B] bg-[#FDECEA] hover:bg-[#FADBD8] border border-[#FADBD8] transition-colors disabled:opacity-50"
                      >
                        {isCallingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <PhoneCall className="w-3.5 h-3.5" />
                        )}
                        Log Guard Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ParcelDetailModal
        isOpen={!!selectedDetailParcel}
        onClose={() => setSelectedDetailParcel(null)}
        parcel={selectedDetailParcel}
      />
    </div>
  );
}
