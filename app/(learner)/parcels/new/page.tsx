'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageIntro } from '@/components/PageIntro';
import { CapacityCallout } from '@/components/CapacityCallout';
import { PrimaryButton } from '@/components/Buttons';
import { Platform } from '@/lib/types';
import { createParcelRequest } from './actions';

export default function NewParcelRequestPage() {
  const router = useRouter();
  const [expectedDate, setExpectedDate] = useState('');
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
    <div className="p-4 max-w-md mx-auto">
      <PageIntro title="Pre-Register a Parcel" subtitle="Save time at Gate. We'll have it ready for you." />

      {error && (
        <div className="mb-4 p-3.5 rounded-xl text-sm bg-[#FDECEA] text-[#C0392B] border border-[#C0392B]/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
            Expected Delivery Date
          </label>
          <input
            type="date"
            required
            min={today}
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
          >
            {Object.values(Platform).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
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
            className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
          />
          <p className="text-xs text-[#6B6B6B] mt-1.5">Only last 4 digits (e.g. 4821)</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
            Collection Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCollectionType('can_be_stored')}
              className={`text-left p-3 rounded-xl border transition-all ${
                collectionType === 'can_be_stored'
                  ? 'border-[#E4572E] bg-[#FDECEA]'
                  : 'border-[#E8E0D8] bg-white'
              }`}
            >
              <div className="font-semibold text-sm text-[#1a1a1a]">Can be stored</div>
              <div className="text-xs text-[#6B6B6B] mt-0.5">I will collect it later</div>
            </button>
            <button
              type="button"
              onClick={() => setCollectionType('immediate')}
              className={`text-left p-3 rounded-xl border transition-all ${
                collectionType === 'immediate'
                  ? 'border-[#E4572E] bg-[#FDECEA]'
                  : 'border-[#E8E0D8] bg-white'
              }`}
            >
              <div className="font-semibold text-sm text-[#1a1a1a]">Immediate collection</div>
              <div className="text-xs text-[#6B6B6B] mt-0.5">I will collect it today</div>
            </button>
          </div>
        </div>

        <CapacityCallout
          currentPackages={currentPackages}
          label="Store Room Capacity"
        />

        <PrimaryButton type="submit" loading={loading}>
          Submit Parcel Request
        </PrimaryButton>
      </form>
    </div>
  );
}
