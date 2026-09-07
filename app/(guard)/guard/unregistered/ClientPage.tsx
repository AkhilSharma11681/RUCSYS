'use client';

import React, { useState, useEffect } from 'react';
import { DetailCard } from '@/components/DetailCard';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PlusCircle, Inbox, Search, MapPin, X, Link as LinkIcon, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { searchPendingRequestsAction, linkUnregisteredParcelAction } from './actions';

interface UnregisteredParcelItem {
  id: string;
  parcelNumber: number;
  storageLocation: string | null;
  arrivedAt: string;
  platform: string;
  notes: string;
}

interface UnregisteredParcelsClientPageProps {
  initialParcels: UnregisteredParcelItem[];
}

export function UnregisteredParcelsClientPage({ initialParcels }: UnregisteredParcelsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Linking modal state
  const [linkingParcel, setLinkingParcel] = useState<UnregisteredParcelItem | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredParcels = initialParcels.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.parcelNumber.toString().includes(q) ||
      p.notes.toLowerCase().includes(q) ||
      (p.storageLocation && p.storageLocation.toLowerCase().includes(q))
    );
  });

  // Debounced search for student/request
  useEffect(() => {
    if (studentSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await searchPendingRequestsAction(studentSearch);
        if (res.success && res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
          if (res.error) setError(res.error);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearch]);

  const handleLink = async (requestId: string) => {
    if (!linkingParcel) return;

    setIsLinking(true);
    setError(null);
    try {
      const res = await linkUnregisteredParcelAction(linkingParcel.id, requestId);
      if (res.success) {
        setLinkingParcel(null);
        setStudentSearch('');
        setSearchResults([]);
      } else {
        setError(res.error || 'Failed to link parcel');
      }
    } catch (err: any) {
      setError(err.message || 'Error linking parcel');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight mb-1">
            Unregistered
          </h1>
          <p className="text-[14px] text-[#6B6B6B]">
            Parcels stored without a matching pre-registration.
          </p>
        </div>
        <Link
          href="/guard/arrivals/new"
          className="inline-flex items-center gap-1.5 bg-[#E4572E] text-white px-3.5 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-transform"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Add</span>
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#6B6B6B]" />
        </div>
        <input
          type="text"
          className="w-full bg-white border border-[#E8E0D8] text-[#1a1a1a] text-[14px] rounded-xl pl-10 pr-10 py-3 outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E] transition-all shadow-sm placeholder:text-[#9A9A9A]"
          placeholder="Search by note, platform, parcel #..."
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
        {filteredParcels.length === 0 ? (
          <DetailCard className="text-center py-10 bg-white">
            <Inbox className="w-10 h-10 mx-auto text-[#E8E0D8] mb-3" />
            <p className="text-sm font-bold text-[#1a1a1a]">
              {searchQuery ? 'No matches found' : 'No unregistered parcels'}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">
              {searchQuery
                ? 'Try a different search term.'
                : 'All stored parcels are matched to a student request.'}
            </p>
          </DetailCard>
        ) : (
          filteredParcels.map(parcel => (
            <div key={parcel.id} className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <PlatformIcon
                    platform={parcel.platform}
                    size="md"
                    className="rounded-xl bg-[#FBF6F1] p-1 border border-[#E8E0D8]/60 mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight mt-1">
                      {parcel.notes}
                    </p>
                    <p className="text-[12px] text-[#6B6B6B] mt-1">
                      Arrived: {new Date(parcel.arrivedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">
                    Parcel #{parcel.parcelNumber}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLinkingParcel(parcel)}
                    className="mt-2 text-xs font-bold text-[#E4572E] bg-[#FFF5F0] hover:bg-[#FFE8DC] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors inline-flex"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D8]/60 text-xs text-[#6B6B6B]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E4572E]" />
                  <span className="font-medium text-[#1a1a1a]">
                    {parcel.storageLocation || 'Unassigned Shelf'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Wrapping Link Modal */}
      {linkingParcel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E8E0D8] bg-[#FBF6F1] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">Link Parcel #{linkingParcel.parcelNumber}</h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5 truncate max-w-[250px]">{linkingParcel.notes}</p>
              </div>
              <button
                type="button"
                onClick={() => { setLinkingParcel(null); setStudentSearch(''); setSearchResults([]); setError(null); }}
                className="text-[#6B6B6B] hover:text-[#1a1a1a] p-2 bg-white rounded-full shadow-sm border border-[#E8E0D8]"
                disabled={isLinking}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-white">
              {error && (
                <div className="mb-4 p-3 bg-[#FDECEA] text-[#C0392B] text-xs rounded-xl flex items-start gap-2 border border-[#FADBD8]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6B6B6B]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search student name, email, or order ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-[#FBF6F1] border border-[#E8E0D8] text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E]"
                />
              </div>

              <div className="space-y-2">
                {studentSearch.length > 0 && studentSearch.length < 2 && (
                  <p className="text-xs text-center text-[#6B6B6B] py-4">Type at least 2 characters to search...</p>
                )}
                {isSearching && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E4572E]" />
                  </div>
                )}
                {!isSearching && studentSearch.length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs text-center text-[#1a1a1a] py-6 font-semibold bg-[#FBF6F1] rounded-xl">No pending requests found matching "{studentSearch}"</p>
                )}
                {!isSearching && searchResults.map(req => (
                  <div key={req.id} className="border border-[#E8E0D8] p-3 rounded-xl hover:border-[#E4572E]/40 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{req.studentName}</p>
                        <p className="text-[11px] text-[#6B6B6B] mt-0.5">{req.studentEmail}</p>
                      </div>
                      <PlatformIcon platform={req.platform} size="sm" className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div>
                        <span className="text-[#6B6B6B]">Platform: </span>
                        <span className="font-semibold">{req.platform}</span>
                      </div>
                      <div>
                        <span className="text-[#6B6B6B]">Order: </span>
                        <span className="font-semibold">*{req.orderLast4}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLink(req.id)}
                      disabled={isLinking}
                      className="mt-3 w-full bg-[#E4572E] hover:bg-[#D04820] text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
                    >
                      {isLinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      <span>Assign to this Request</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
