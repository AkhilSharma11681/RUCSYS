import React from 'react';
import { X, Package, Clock, MapPin, User, Hash, FileText } from 'lucide-react';
import { PlatformIcon } from '@/components/PlatformIcon';
import { StatusPill } from '@/components/StatusPill';

interface ParcelDetail {
  id: string;
  parcelNumber?: number;
  studentName?: string;
  platform?: string;
  orderLast4?: string;
  expectedDate?: string;
  arrivedAt?: string | null;
  storageLocation?: string | null;
  collectionType?: string | null;
  status?: string | null;
  notes?: string;
  isUnregistered?: boolean;
}

interface ParcelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: ParcelDetail | null;
}

export function ParcelDetailModal({ isOpen, onClose, parcel }: ParcelDetailModalProps) {
  if (!isOpen || !parcel) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#E8E0D8] bg-[#FBF6F1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#E4572E]" />
            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Parcel Details</h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E8E0D8] rounded-full text-[#6B6B6B] hover:text-[#1a1a1a] shadow-sm active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto bg-white space-y-4">
          {/* Header Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#E8E0D8]/60">
            {parcel.platform && (
              <PlatformIcon platform={parcel.platform} size="lg" className="rounded-xl border border-[#E8E0D8]/60 p-1.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-[#1a1a1a] text-lg">
                {parcel.isUnregistered ? 'Unregistered Parcel' : (parcel.studentName || 'Student Parcel')}
              </h3>
              <p className="text-[#6B6B6B] text-[13px] font-medium flex items-center gap-1.5 mt-0.5">
                {parcel.platform || 'Unknown'} 
                {parcel.orderLast4 && <span>&middot; Order ...{parcel.orderLast4}</span>}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            {parcel.parcelNumber !== undefined && (
              <div className="flex items-start gap-3 bg-[#FBF6F1] p-3 rounded-xl border border-[#E8E0D8]/40">
                <Hash className="w-4 h-4 text-[#E4572E] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">Parcel Number</p>
                  <p className="font-bold text-[#1a1a1a]">#{parcel.parcelNumber}</p>
                </div>
              </div>
            )}

            {parcel.status && (
              <div className="flex items-start gap-3 bg-[#FBF6F1] p-3 rounded-xl border border-[#E8E0D8]/40">
                <StatusPill status={parcel.status as any} size="sm" className="mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">Current Status</p>
                  <p className="font-medium text-[#1a1a1a]">{parcel.status.replace(/_/g, ' ').toUpperCase()}</p>
                </div>
              </div>
            )}

            {parcel.storageLocation && (
              <div className="flex items-start gap-3 bg-[#FBF6F1] p-3 rounded-xl border border-[#E8E0D8]/40">
                <MapPin className="w-4 h-4 text-[#E4572E] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">Storage Shelf / Rack</p>
                  <p className="font-medium text-[#1a1a1a]">{parcel.storageLocation}</p>
                </div>
              </div>
            )}

            {parcel.arrivedAt && (
              <div className="flex items-start gap-3 bg-[#FBF6F1] p-3 rounded-xl border border-[#E8E0D8]/40">
                <Clock className="w-4 h-4 text-[#E4572E] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">Arrival Date & Time</p>
                  <p className="font-medium text-[#1a1a1a]">{new Date(parcel.arrivedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {parcel.expectedDate && (
              <div className="flex items-start gap-3 bg-[#FBF6F1] p-3 rounded-xl border border-[#E8E0D8]/40">
                <Clock className="w-4 h-4 text-[#6B6B6B] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">Expected Delivery Date</p>
                  <p className="font-medium text-[#1a1a1a]">{new Date(parcel.expectedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {parcel.notes && (
              <div className="flex items-start gap-3 bg-[#F3EDE6] p-3 rounded-xl border border-[#D1C8C0]/40">
                <FileText className="w-4 h-4 text-[#8C7A6B] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-0.5">Label Notes / Description</p>
                  <p className="font-medium text-[#1a1a1a] whitespace-pre-wrap leading-relaxed text-[13px]">{parcel.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop click handler */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
}
