'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { searchAwaitingCollectionAction } from './actions';
import { Search, Loader2, CheckCircle2, AlertCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { PrimaryButton } from '@/components/Buttons';

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

  // Selection & Verification state
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<
    'idle' | 'success' | 'invalid' | 'locked' | 'already_collected' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

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

  const handleSelectParcel = (parcelId: string) => {
    if (selectedParcelId === parcelId) {
      // Toggle close if already open
      setSelectedParcelId(null);
    } else {
      setSelectedParcelId(parcelId);
      setOtpCode('');
      setVerifyStatus('idle');
      setErrorMessage(null);
      setAttemptsRemaining(null);
    }
  };

  const handleVerifyOtp = async (parcelId: string) => {
    if (!/^\d{4}$/.test(otpCode.trim())) {
      setVerifyStatus('error');
      setErrorMessage('Please enter a valid 4-digit numeric code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/parcels/${parcelId}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: otpCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerifyStatus('success');
        // Remove the parcel from the active results list after a brief delay
        setTimeout(() => {
          setResults((prev) => prev.filter((p) => p.id !== parcelId));
          setSelectedParcelId(null);
        }, 2000);
      } else if (data.reason === 'invalid') {
        setVerifyStatus('invalid');
        setAttemptsRemaining(data.attemptsRemaining ?? null);
        setErrorMessage(
          `Invalid code. ${
            data.attemptsRemaining !== undefined
              ? `${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? '' : 's'} remaining.`
              : ''
          }`
        );
      } else if (data.reason === 'locked') {
        setVerifyStatus('locked');
        setErrorMessage(
          'Too many failed attempts. Ask the learner to regenerate their code from the app, or contact support.'
        );
      } else if (data.reason === 'already_collected') {
        setVerifyStatus('already_collected');
        setErrorMessage('This parcel has already been collected.');
      } else if (response.status === 400) {
        setVerifyStatus('error');
        setErrorMessage(data.error || 'Invalid code format.');
      } else if (response.status === 404) {
        setVerifyStatus('error');
        setErrorMessage('Parcel not found.');
      } else {
        setVerifyStatus('error');
        setErrorMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setVerifyStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

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
            {results.map((parcel) => {
              const isSelected = selectedParcelId === parcel.id;

              return (
                <li key={parcel.id} className="transition-colors">
                  <div
                    onClick={() => handleSelectParcel(parcel.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[#FBF6F1]/50 ${
                      isSelected ? 'bg-[#FBF6F1]' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#1a1a1a] flex items-center gap-2">
                        <span>
                          Parcel #{parcel.parcelNumber} &middot; {parcel.studentName}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B6B6B]">
                        {parcel.platform} &middot; Order ...{parcel.orderLast4} &middot; Location:{' '}
                        {parcel.storageLocation || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFF6F0] text-[#E4572E] font-medium border border-[#FEE4D6]">
                        {parcel.status || 'arrived'}
                      </span>
                      {isSelected ? (
                        <ChevronUp className="w-4 h-4 text-[#6B6B6B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
                      )}
                    </div>
                  </div>

                  {/* Inline Verification Form */}
                  {isSelected && (
                    <div className="p-4 bg-[#FBF6F1] border-t border-[#E8E0D8]/60 space-y-4">
                      {verifyStatus === 'success' ? (
                        <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl flex items-center space-x-3 text-[#2E7D4F]">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold">Parcel collected successfully!</p>
                            <p className="text-xs text-[#2E7D4F]/80">Updating collection records...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {verifyStatus === 'locked' ? (
                            <div className="p-4 bg-[#FDECEA] border border-[#FADBD8] rounded-xl flex items-start space-x-3 text-[#C0392B]">
                              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold">Account Locked for this Parcel</p>
                                <p className="text-xs mt-1 leading-relaxed">{errorMessage}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-[#1a1a1a]">
                                Enter 4-digit Collection OTP
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={otpCode}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setOtpCode(val);
                                    if (verifyStatus !== 'idle') {
                                      setVerifyStatus('idle');
                                      setErrorMessage(null);
                                    }
                                  }}
                                  placeholder="4-digit code"
                                  disabled={isVerifying}
                                  className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-3 text-lg font-bold tracking-widest text-center focus:outline-none focus:border-[#E4572E]"
                                />
                                <PrimaryButton
                                  type="button"
                                  onClick={() => handleVerifyOtp(parcel.id)}
                                  loading={isVerifying}
                                  disabled={otpCode.length !== 4 || isVerifying}
                                  className="w-32 h-[50px] shrink-0"
                                >
                                  Verify
                                </PrimaryButton>
                              </div>

                              {errorMessage && (
                                <div className="flex items-center space-x-2 text-xs font-semibold text-[#C0392B] bg-[#FDECEA] p-2.5 rounded-lg border border-[#FADBD8]">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{errorMessage}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
