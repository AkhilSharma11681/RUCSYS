'use client';

import React, { useState, useTransition } from 'react';
import { updateCapacityConfigAction } from './actions';
import { DetailCard } from '@/components/DetailCard';
import { PrimaryButton } from '@/components/Buttons';
import { CheckCircle2, AlertCircle, Sliders, Clock, Info } from 'lucide-react';

interface ConfigData {
  maxCapacity: number;
  pauseNewRequestsAtPct: number;
  reminderAfterDays: number;
  notifyAfterDays: number;
  callAfterDays: number;
  deadlineAfterDays: number;
}

export function SettingsForm({ initialConfig }: { initialConfig: ConfigData }) {
  const [formData, setFormData] = useState<ConfigData>(initialConfig);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof ConfigData, value: string) => {
    const numericValue = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? '' : numericValue,
    }));
    if (successMessage) setSuccessMessage(null);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const data = new FormData();
    data.append('maxCapacity', String(formData.maxCapacity));
    data.append('pauseNewRequestsAtPct', String(formData.pauseNewRequestsAtPct));
    data.append('reminderAfterDays', String(formData.reminderAfterDays));
    data.append('notifyAfterDays', String(formData.notifyAfterDays));
    data.append('callAfterDays', String(formData.callAfterDays));
    data.append('deadlineAfterDays', String(formData.deadlineAfterDays));

    startTransition(async () => {
      const res = await updateCapacityConfigAction(data);
      if (res.success) {
        setSuccessMessage('Settings saved — changes take effect on the next cron run.');
      } else {
        setErrorMessage(res.error || 'Failed to save settings.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Storage & Capacity Group */}
      <DetailCard>
        <div className="flex items-center space-x-2.5 pb-4 border-b border-[#E8E0D8]/60 mb-5">
          <Sliders className="w-5 h-5 text-[#E4572E]" />
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Capacity Limits</h2>
            <p className="text-xs text-[#6B6B6B]">Gate No. 2 physical storage space thresholds</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Maximum Active Capacity (Parcels)
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a]"
            />
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Total number of uncollected parcels the storage area can accommodate.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Registration Pause Threshold (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                required
                value={formData.pauseNewRequestsAtPct}
                onChange={(e) => handleChange('pauseNewRequestsAtPct', e.target.value)}
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a] pr-10"
              />
              <span className="absolute right-4 top-3 text-sm font-semibold text-[#6B6B6B] pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              When active parcels reach this capacity percentage, new learner registrations are paused.
            </p>
          </div>
        </div>
      </DetailCard>

      {/* 2. Escalation Days Group */}
      <DetailCard>
        <div className="flex items-center space-x-2.5 pb-4 border-b border-[#E8E0D8]/60 mb-5">
          <Clock className="w-5 h-5 text-[#E4572E]" />
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Overdue Escalation Timeline</h2>
            <p className="text-xs text-[#6B6B6B]">Day intervals after parcel arrival</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              1. Learner Reminder (Days)
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.reminderAfterDays}
              onChange={(e) => handleChange('reminderAfterDays', e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a]"
            />
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              First automated reminder sent to student.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              2. Founder&apos;s Office Notify (Days)
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.notifyAfterDays}
              onChange={(e) => handleChange('notifyAfterDays', e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a]"
            />
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Parcel flagged in admin dashboard.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              3. Support Call Escalation (Days)
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.callAfterDays}
              onChange={(e) => handleChange('callAfterDays', e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a]"
            />
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Direct phone contact required.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              4. Final Disposal Deadline (Days)
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.deadlineAfterDays}
              onChange={(e) => handleChange('deadlineAfterDays', e.target.value)}
              className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors font-medium text-[#1a1a1a]"
            />
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Final claim deadline before return/disposal.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#FFF5F0] border border-[#FCDDC9] rounded-xl flex items-start space-x-2.5 text-[#E4572E]">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">
            Escalation thresholds must follow a strictly ascending order: Reminder &lt; Notify &lt; Call &lt; Deadline.
          </p>
        </div>
      </DetailCard>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-[#FDECEA] border border-[#FADBD8] rounded-xl flex items-center space-x-3 text-[#C0392B]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl flex items-center space-x-3 text-[#2E7D4F]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <PrimaryButton type="submit" loading={isPending}>
        Save Configuration
      </PrimaryButton>
    </form>
  );
}
