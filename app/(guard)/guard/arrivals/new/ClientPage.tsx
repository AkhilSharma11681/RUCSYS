'use client';

import React, { useState } from 'react';
import { DetailCard } from '@/components/DetailCard';
import { PrimaryButton } from '@/components/Buttons';
import { storeUnregisteredParcelAction } from './actions';
import { Platform } from '@/lib/types';
import { PackagePlus, User, Building2, Hash, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface UnregisteredArrivalClientPageProps {
  suggestedNumbers: number[];
  suggestedLocation: string;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: Platform.AMAZON, label: 'Amazon' },
  { value: Platform.FLIPKART, label: 'Flipkart' },
  { value: Platform.MYNTRA, label: 'Myntra' },
  { value: Platform.MEESHO, label: 'Meesho' },
  { value: Platform.ZEPTO, label: 'Zepto' },
  { value: Platform.BLINKIT, label: 'Blinkit' },
  { value: Platform.BLUEDART, label: 'BlueDart' },
  { value: Platform.DELHIVERY, label: 'Delhivery' },
  { value: Platform.OTHER, label: 'Other / Courier' },
];

export function UnregisteredArrivalClientPage({
  suggestedNumbers,
  suggestedLocation,
}: UnregisteredArrivalClientPageProps) {
  const [recipientName, setRecipientName] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.AMAZON);
  const [orderId, setOrderId] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(
    suggestedNumbers.length > 0 ? suggestedNumbers[0] : null
  );
  const [storageLocation, setStorageLocation] = useState(suggestedLocation);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recipientName.trim() || !selectedNumber || !storageLocation.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('recipientName', recipientName.trim());
    formData.append('platform', platform);
    formData.append('orderId', orderId.trim());
    formData.append('parcelNumber', selectedNumber.toString());
    formData.append('storageLocation', storageLocation.trim());
    formData.append('notes', notes.trim());

    const result = await storeUnregisteredParcelAction(formData);
    if (result && !result.success) {
      setError(result.error || 'Failed to save unregistered parcel.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight mb-1">
          Log Unregistered Parcel
        </h1>
        <p className="text-[14px] text-[#6B6B6B]">
          Quickly log a delivery that arrived at Gate No. 2 with no matching pre-registration.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm bg-[#FDECEA] text-[#C0392B] border border-[#FADBD8] flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <DetailCard className="space-y-4">
          <div className="border-b border-[#E8E0D8]/60 pb-3">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-wider">
              Shipping Label Details
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Read best guess info directly from the parcel shipping label.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E4572E]" />
              Recipient Name *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Ananya Sharma"
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#E4572E]" />
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#E4572E]" />
                Order / Tracking ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 402-9182391 or last 4 digits"
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
              />
            </div>
          </div>
        </DetailCard>

        <DetailCard className="space-y-4">
          <div className="border-b border-[#E8E0D8]/60 pb-3">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-wider">
              Physical Storage Assignment
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Mark the box number and place in the designated shelf.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-2">
              Assign Parcel Number *
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {suggestedNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedNumber(num)}
                  className={`
                    shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                    transition-all duration-200 border-2
                    ${
                      selectedNumber === num
                        ? 'bg-[#E4572E] border-[#E4572E] text-white shadow-md'
                        : 'bg-white border-[#E8E0D8]/80 text-[#1a1a1a] hover:border-[#E4572E]/50'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
            {!selectedNumber && (
              <p className="text-red-500 text-xs mt-1">Please select a parcel number.</p>
            )}
          </div>

          <div>
            <label
              htmlFor="storageLocation"
              className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E4572E]" />
              Storage Shelf / Location *
            </label>
            <input
              id="storageLocation"
              type="text"
              required
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="e.g. Shelf B &middot; Row 1"
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#E4572E]" />
              Optional Condition / Box Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="e.g. Slightly torn outer cover, large heavy carton"
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
            />
          </div>
        </DetailCard>

        <PrimaryButton
          type="submit"
          fullWidth
          disabled={!recipientName.trim() || !selectedNumber || !storageLocation.trim() || isSubmitting}
          loading={isSubmitting}
          className="!h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Store Unregistered Parcel
          </span>
        </PrimaryButton>
      </form>
    </div>
  );
}
