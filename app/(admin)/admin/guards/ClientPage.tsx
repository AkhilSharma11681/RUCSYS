'use client';

import React, { useState, useTransition } from 'react';
import { createGuardAction, deleteGuardAction } from './actions';
import { GuardRecord } from '@/lib/repositories/GuardRepository';
import { DetailCard } from '@/components/DetailCard';
import { PrimaryButton, OutlineButton } from '@/components/Buttons';
import { AlertCircle, CheckCircle2, ShieldCheck, Mail, KeyRound, Copy, Plus, Trash2 } from 'lucide-react';

interface GuardsManagerProps {
  initialGuards: GuardRecord[];
}

export function GuardsManager({ initialGuards }: GuardsManagerProps) {
  const [guards, setGuards] = useState<GuardRecord[]>(initialGuards);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // To store the one-time generated password returned by the server
  const [createdGuardCredentials, setCreatedGuardCredentials] = useState<{
    email: string;
    plaintextPassword: string;
  } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gateNumber, setGateNumber] = useState('Gate No. 2');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCreatedGuardCredentials(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('gateNumber', gateNumber);

    startTransition(async () => {
      const res = await createGuardAction(formData);
      if (res.success && res.guard && res.plaintextPassword) {
        setGuards((prev) => [res.guard!, ...prev]);
        setCreatedGuardCredentials({
          email: res.guard.email,
          plaintextPassword: res.plaintextPassword,
        });
        setIsAddMode(false);
        setFullName('');
        setEmail('');
        setGateNumber('Gate No. 2');
      } else {
        setErrorMessage(res.error || 'Failed to create guard account.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to remove access for "${name}"?`);
    if (!confirmDelete) return;

    setErrorMessage(null);
    setCreatedGuardCredentials(null);

    startTransition(async () => {
      const res = await deleteGuardAction(id);
      if (res.success) {
        setGuards((prev) => prev.filter((g) => g.id !== id));
      } else {
        setErrorMessage(res.error || 'Failed to delete guard account.');
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Password copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-[#FDECEA] border border-[#FADBD8] rounded-xl flex items-center space-x-3 text-[#C0392B]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {createdGuardCredentials && (
        <div className="p-5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[16px] shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-[#2E7D4F] border-b border-[#C8E6C9]/60 pb-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="text-[15px] font-bold">Guard Account Created!</h3>
          </div>
          <div className="space-y-4 pt-1">
            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-[#C8E6C9]/40">
              <div className="bg-[#E8F5E9] p-2 rounded-lg text-[#2E7D4F]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wide">Login Email</p>
                <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{createdGuardCredentials.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-[#C8E6C9]/40">
              <div className="bg-[#E8F5E9] p-2 rounded-lg text-[#2E7D4F]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wide">Generated Password</p>
                <p className="text-[14px] font-bold text-[#1a1a1a] font-mono tracking-wider truncate">
                  {createdGuardCredentials.plaintextPassword}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(createdGuardCredentials.plaintextPassword)}
                className="p-2.5 hover:bg-[#FBF6F1] rounded-lg transition-colors text-[#6B6B6B] hover:text-[#1a1a1a]"
                title="Copy Password"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs font-semibold text-[#2E7D4F] pt-2">
            Please copy and share this password with the guard. It will not be shown again.
          </p>
        </div>
      )}

      {/* Add New Guard Mode */}
      {isAddMode ? (
        <DetailCard className="border-[#E4572E]/30 bg-white shadow-md">
          <div className="pb-4 border-b border-[#E8E0D8]/60 mb-5">
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Register New Guard</h2>
            <p className="text-xs text-[#6B6B6B] mt-1">A secure password will be generated automatically.</p>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Ramesh Singh"
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., guard.name@rishihood.edu.in"
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Assigned Gate
              </label>
              <input
                type="text"
                value={gateNumber}
                onChange={(e) => setGateNumber(e.target.value)}
                className="w-full bg-[#FBF6F1]/50 border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E4572E] focus:bg-white transition-colors text-[#1a1a1a]"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <PrimaryButton type="submit" loading={isPending}>
                Create Account
              </PrimaryButton>
              <OutlineButton
                type="button"
                onClick={() => setIsAddMode(false)}
                disabled={isPending}
              >
                Cancel
              </OutlineButton>
            </div>
          </form>
        </DetailCard>
      ) : (
        <PrimaryButton type="button" onClick={() => setIsAddMode(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add New Guard
        </PrimaryButton>
      )}

      {/* List of Guards */}
      <h2 className="text-[14px] font-bold text-[#1a1a1a] mt-8 mb-4 flex items-center">
        <ShieldCheck className="w-4 h-4 mr-1.5 text-[#E4572E]" />
        Active Guard Accounts ({guards.length})
      </h2>

      {guards.length === 0 ? (
        <DetailCard className="text-center py-10 bg-[#FBF6F1]/50">
          <ShieldCheck className="w-10 h-10 mx-auto text-[#E8E0D8] mb-3" />
          <p className="text-sm font-semibold text-[#1a1a1a]">No guards found</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Add a guard to grant them access to the gate dashboard.</p>
        </DetailCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {guards.map((guard) => (
            <DetailCard key={guard.id} className="relative group">
              <div className="pr-10">
                <h3 className="text-[15px] font-bold text-[#1a1a1a] truncate">{guard.fullName}</h3>
                <p className="text-sm font-medium text-[#6B6B6B] mt-0.5 truncate">{guard.email}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FBF6F1] text-[#6B6B6B] border border-[#E8E0D8]">
                    {guard.gateNumber}
                  </span>
                  <span className="text-[10px] font-medium text-[#A0A0A0]">
                    Added {new Date(guard.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(guard.id, guard.fullName)}
                disabled={isPending}
                className="absolute top-4 right-4 p-2 text-[#C0392B] bg-[#FDECEA] hover:bg-[#FADBD8] rounded-lg transition-colors opacity-80 hover:opacity-100 disabled:opacity-50"
                title="Remove Access"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </DetailCard>
          ))}
        </div>
      )}
    </div>
  );
}
