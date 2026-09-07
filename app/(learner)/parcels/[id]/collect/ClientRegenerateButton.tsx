'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';
import { regenerateOtpAction } from './actions';

export function ClientRegenerateButton({ requestId }: { requestId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    const result = await regenerateOtpAction(requestId);
    setIsLoading(false);

    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error || 'Failed to regenerate code.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-6 flex items-center space-x-2 text-[#E4572E] text-sm font-bold opacity-90 hover:opacity-100 hover:underline transition-all cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Regenerate Code</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-[#E8E0D8] space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] text-[#E4572E] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => !isLoading && setIsOpen(false)}
                className="text-[#6B6B6B] hover:text-[#1a1a1a] p-1"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                Regenerate Collection Code?
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                This will immediately invalidate your current 4-digit code. If someone is currently on their way to collect the parcel on your behalf, they will need the new code.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#FDECEA] text-[#C0392B] text-xs rounded-xl border border-[#FADBD8]">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#E8E0D8] text-xs font-bold text-[#6B6B6B] hover:bg-[#FBF6F1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#E4572E] hover:bg-[#D04820] text-xs font-bold text-white shadow-sm flex items-center justify-center space-x-1.5 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <span>Yes, Regenerate</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
