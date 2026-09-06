'use client';

import React, { useState } from 'react';
import { DetailCard } from '@/components/DetailCard';
import { DetailGrid } from '@/components/DetailGrid';
import { PrimaryButton } from '@/components/Buttons';
import { storeParcelAction } from './actions';
import { Package, Smartphone, Calendar, MapPin, CheckCircle } from 'lucide-react';

interface ArrivalClientPageProps {
  request: {
    id: string;
    platform: string;
    orderLast4: string;
    expectedDate: string;
    collectionType: string;
  };
  suggestedNumbers: number[];
  suggestedLocation: string;
}

export function ArrivalClientPage({
  request,
  suggestedNumbers,
  suggestedLocation,
}: ArrivalClientPageProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(
    suggestedNumbers.length > 0 ? suggestedNumbers[0] : null
  );
  const [storageLocation, setStorageLocation] = useState(suggestedLocation);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date display
  const expectedDateFormatted = new Date(request.expectedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">Mark Arrived</h1>
        <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
          Confirm details and assign a storage location.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[16px] text-sm bg-[#FDECEA] text-[#C0392B] border border-[#FADBD8]">
          {error}
        </div>
      )}

      <DetailCard>
        <div className="mb-4 text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">
          Package Details
        </div>
        <DetailGrid
          columns={2}
          items={[
            {
              icon: Package,
              label: 'Platform',
              value: request.platform,
            },
            {
              icon: Smartphone,
              label: 'Order',
              value: `...${request.orderLast4}`,
            },
            {
              icon: Calendar,
              label: 'Expected',
              value: expectedDateFormatted,
            },
            {
              icon: MapPin,
              label: 'Collection',
              value: request.collectionType === 'immediate' ? 'Immediate' : 'Can be stored',
            },
          ]}
        />
      </DetailCard>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-2">
            Assign Parcel Number
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
            <p className="text-red-500 text-sm mt-1">Please select a parcel number.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="storageLocation"
            className="block text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-2"
          >
            Storage Location
          </label>
          <input
            id="storageLocation"
            type="text"
            required
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            placeholder="e.g. Shelf A &middot; Row 2"
            className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-3 text-[#1a1a1a] font-medium outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E] transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-2"
          >
            Optional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Condition, oversized, etc."
            className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-3 text-[#1a1a1a] resize-none outline-none focus:border-[#E4572E] focus:ring-1 focus:ring-[#E4572E] transition-all"
          />
        </div>
      </div>

      <div className="pt-4">
        <form
          action={async (formData) => {
            if (!selectedNumber || !storageLocation.trim()) return;
            setError(null);
            setIsSubmitting(true);
            const result = await storeParcelAction(formData);
            if (result && !result.success) {
              setError(result.error || 'Failed to store parcel');
              setIsSubmitting(false);
            }
          }}
        >
          <input type="hidden" name="requestId" value={request.id} />
          {selectedNumber && <input type="hidden" name="parcelNumber" value={selectedNumber.toString()} />}
          <input type="hidden" name="storageLocation" value={storageLocation} />
          <input type="hidden" name="notes" value={notes} />

          <PrimaryButton
            type="submit"
            className="w-full"
            disabled={!selectedNumber || !storageLocation.trim() || isSubmitting}
            loading={isSubmitting}
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Confirm & Store Parcel</span>
            </span>
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
