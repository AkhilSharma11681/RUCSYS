'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageIntro } from '@/components/PageIntro';
import { CapacityCallout } from '@/components/CapacityCallout';
import { PrimaryButton } from '@/components/Buttons';
import { Platform } from '@/lib/types';
import { IllustratedBox } from '@/components/IllustratedBox';
import { PlatformIcon } from '@/components/PlatformIcon';
import { Calendar, ChevronDown } from 'lucide-react';
import { createParcelRequest } from './actions';

export default function NewParcelRequestPage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [expectedDate, setExpectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [platform, setPlatform] = useState<string>(Platform.AMAZON);
  const [orderLast4, setOrderLast4] = useState('');
  const [collectionType, setCollectionType] = useState<'can_be_stored' | 'immediate'>('can_be_stored');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPackages, setCurrentPackages] = useState(0);

  useEffect(() => {
    fetch('/api/capacity')
      .then((r) => r.json())
      .then((d) => setCurrentPackages(d.currentPackages ?? 0))
      .catch(() => {});
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[0-9]{4}$/.test(orderLast4)) {
      setError('Order ID must be exactly 4 digits.');
      return;
    }
    setLoading(true);
    const result = await createParcelRequest({ platform, orderLast4, expectedDate, collectionType });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(`/parcels/${result.request.id}/confirmation`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1]">
      <div className="flex items-start justify-between mb-8 mt-2">
        <PageIntro
          title="Pre-Register a Parcel"
          subtitle="Save time at Gate. We'll have it ready for you."
          badge={<IllustratedBox variant="open" size={84} />}
          className="mb-0 !pb-0"
        />
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-[16px] text-sm bg-[#FDECEA] text-[#C0392B] border border-[#FADBD8]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {/* Expected Delivery Date */}
        <div>
          <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">
            Expected Delivery Date
          </label>
          <div
            onClick={() => {
              if (dateInputRef.current) {
                if (typeof dateInputRef.current.showPicker === 'function') {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.focus();
                }
              }
            }}
            className="relative w-full px-4 py-3.5 rounded-[16px] border border-[#E8E0D8] bg-white flex items-center justify-between shadow-sm cursor-pointer hover:border-[#D8CFC7] transition-all"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#6B6B6B]" />
              <span className="text-sm font-medium text-[#1a1a1a]">
                {formatDateDisplay(expectedDate)}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#1a1a1a]" />
            <input
              ref={dateInputRef}
              type="date"
              required
              min={today}
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">
            Platform
          </label>
          <div className="relative w-full rounded-[16px] border border-[#E8E0D8] bg-white shadow-sm hover:border-[#D8CFC7] transition-all">
            <div className="px-4 py-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center space-x-3">
                <PlatformIcon platform={platform} size="sm" />
                <span className="text-sm font-medium text-[#1a1a1a]">{platform}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1a1a1a]" />
            </div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-sm"
            >
              {Object.values(Platform).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Last 4 Digits of Order ID */}
        <div>
          <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">
            Last 4 Digits of Order ID
          </label>
          <input
            type="text"
            required
            maxLength={4}
            inputMode="numeric"
            placeholder="4821"
            value={orderLast4}
            onChange={(e) => setOrderLast4(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3.5 rounded-[16px] border border-[#E8E0D8] bg-white text-sm font-medium text-[#1a1a1a] placeholder:text-[#A69B91] focus:outline-none focus:ring-2 focus:ring-[#E4572E]/40 focus:border-[#E4572E] transition-all shadow-sm"
          />
          <p className="text-xs text-[#6B6B6B] mt-1.5 font-normal pl-0.5">
            Only last 4 digits (e.g. 4821)
          </p>
        </div>

        {/* Collection Type */}
        <div>
          <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">
            Collection Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Can be stored */}
            <button
              type="button"
              onClick={() => setCollectionType('can_be_stored')}
              className={`text-left p-3.5 sm:p-4 rounded-[16px] border transition-all ${
                collectionType === 'can_be_stored'
                  ? 'border-[#E4572E] bg-[#FFF8F5] shadow-sm'
                  : 'border-[#E8E0D8] bg-white hover:bg-[#FDFBF9] shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    collectionType === 'can_be_stored'
                      ? 'border-[#E4572E]'
                      : 'border-[#D8CFC7]'
                  }`}
                >
                  {collectionType === 'can_be_stored' && (
                    <div className="w-2.5 h-2.5 bg-[#E4572E] rounded-full" />
                  )}
                </div>
                <div className="font-bold text-[14px] text-[#1a1a1a]">
                  Can be stored
                </div>
              </div>
              <div className="text-xs text-[#6B6B6B] leading-snug pl-7 font-normal">
                I will collect it later
              </div>
            </button>

            {/* Immediate collection */}
            <button
              type="button"
              onClick={() => setCollectionType('immediate')}
              className={`text-left p-3.5 sm:p-4 rounded-[16px] border transition-all ${
                collectionType === 'immediate'
                  ? 'border-[#E4572E] bg-[#FFF8F5] shadow-sm'
                  : 'border-[#E8E0D8] bg-white hover:bg-[#FDFBF9] shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    collectionType === 'immediate'
                      ? 'border-[#E4572E]'
                      : 'border-[#D8CFC7]'
                  }`}
                >
                  {collectionType === 'immediate' && (
                    <div className="w-2.5 h-2.5 bg-[#E4572E] rounded-full" />
                  )}
                </div>
                <div className="font-bold text-[14px] text-[#1a1a1a]">
                  Immediate collection
                </div>
              </div>
              <div className="text-xs text-[#6B6B6B] leading-snug pl-7 font-normal">
                I will collect it today
              </div>
            </button>
          </div>
        </div>

        {/* Store Room Capacity Callout */}
        <div className="pt-1">
          <CapacityCallout
            currentPackages={currentPackages}
            label="Store Room Capacity"
            icon="info"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <PrimaryButton type="submit" loading={loading} className="py-4 text-base font-bold">
            Submit Parcel Request
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
