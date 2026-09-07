'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailCard } from '@/components/DetailCard';
import { PrimaryButton } from '@/components/Buttons';
import { PlatformIcon } from '@/components/PlatformIcon';
import { IllustratedBox } from '@/components/IllustratedBox';
import Link from 'next/link';
import {
  PackageOpen,
  ArchiveX,
  CheckCircle,
  ChevronRight,
  Info,
  Clock,
  Calendar,
  Package,
  Hash,
  Headphones,
} from 'lucide-react';
import { cancelParcelRequest } from './actions';

// Types mapping what was passed from the server
type SerializedRequest = {
  id: string;
  studentId: string;
  platform: string;
  orderLast4: string;
  expectedDate: string;
  collectionType: 'can_be_stored' | 'immediate';
  status: 'pending' | 'arrived' | 'ready_for_pickup' | 'collected' | 'cancelled' | 'overdue';
  createdAt: string;
};

export function MyParcelsClient({ requests }: { requests: SerializedRequest[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'collected' | 'cancelled'>('active');
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const activeStatuses = ['pending', 'arrived', 'ready_for_pickup', 'overdue'];

  const activeRequests = requests.filter((r) => activeStatuses.includes(r.status));
  const collectedRequests = requests.filter((r) => r.status === 'collected');
  const cancelledRequests = requests.filter((r) => r.status === 'cancelled');

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this parcel request?')) {
      return;
    }

    setIsCancelling(id);
    const result = await cancelParcelRequest(id);
    setIsCancelling(null);
    if (!result.success) {
      alert(result.error || 'Failed to cancel request');
    }
  };

  const handleCardClick = (request: SerializedRequest) => {
    if (request.status === 'ready_for_pickup') {
      router.push(`/parcels/${request.id}/collect`);
    } else {
      router.push(`/parcels/${request.id}`);
    }
  };

  const renderCompactCard = (request: SerializedRequest, type: 'collected' | 'cancelled') => {
    const reqDateObj = new Date(request.createdAt);
    const isCollected = type === 'collected';

    return (
      <div
        key={request.id}
        onClick={() => handleCardClick(request)}
        className="bg-white rounded-2xl border border-[#E8E0D8]/60 p-3.5 flex items-center justify-between shadow-xs hover:border-[#E4572E]/40 transition-all cursor-pointer mb-2.5"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-[44px] h-[44px] border border-[#E8E0D8]/60 rounded-xl flex items-center justify-center shrink-0 bg-white overflow-hidden">
            <PlatformIcon platform={request.platform} size="md" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-[#1a1a1a] text-[14px]">
              {request.platform}
            </h3>
            <div className="text-[12px] text-[#6B6B6B] mt-0.5">
              Order ID ending with <span className="font-bold text-[#1a1a1a]">{request.orderLast4}</span>
            </div>
            <div className="text-[11px] text-[#A69B91] mt-0.5">
              {reqDateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isCollected ? (
            <div className="bg-[#F0FDF4] text-[#166534] text-[11px] font-semibold px-2 py-1 rounded-full flex items-center space-x-1 border border-[#DCFCE7]">
              <span>✓</span>
              <span>Collected</span>
            </div>
          ) : (
            <div className="bg-[#FEF2F2] text-[#991B1B] text-[11px] font-semibold px-2 py-1 rounded-full flex items-center space-x-1 border border-[#FEE2E2]">
              <ArchiveX className="w-3 h-3" strokeWidth={2.5} />
              <span>Cancelled</span>
            </div>
          )}
          <ChevronRight className="w-[18px] h-[18px] text-[#A69B91]" strokeWidth={2} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* SECTION A: Header + Tabs */}
      <div className="flex items-start justify-between mb-6 mt-1">
        <div className="pr-4 mt-2">
          <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1.5 leading-tight tracking-tight">
            My Parcel Requests
          </h1>
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed max-w-[200px]">
            Track all your parcel requests in one place.
          </p>
        </div>
        <div className="shrink-0 -mt-2 -mr-3">
          <IllustratedBox variant="sealed" size={100} />
        </div>
      </div>

      <div className="flex bg-[#FFFFFF] rounded-2xl p-[6px] border border-[#E8E0D8]/60 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('active')}
          className={`min-w-fit px-3 py-2.5 text-[13px] font-bold rounded-[12px] transition-all flex items-center justify-center space-x-1.5 flex-1 ${
            activeTab === 'active'
              ? 'bg-[#FFF5F0] text-[#E4572E] border border-[#FCDDC9]/60 shadow-[0_2px_4px_rgba(228,87,46,0.05)]'
              : 'bg-transparent text-[#6B6B6B] border border-transparent font-medium hover:bg-gray-50'
          }`}
        >
          <PackageOpen className="w-[15px] h-[15px]" strokeWidth={2.5} />
          <span>Active ({activeRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collected')}
          className={`min-w-fit px-3 py-2.5 text-[13px] rounded-[12px] transition-all flex items-center justify-center space-x-1.5 flex-1 ${
            activeTab === 'collected'
              ? 'bg-[#FFF5F0] text-[#E4572E] border border-[#FCDDC9]/60 shadow-[0_2px_4px_rgba(228,87,46,0.05)] font-bold'
              : 'bg-transparent text-[#6B6B6B] border border-transparent font-medium hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="w-[15px] h-[15px]" strokeWidth={2.5} />
          <span>Collected ({collectedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`min-w-fit px-3 py-2.5 text-[13px] rounded-[12px] transition-all flex items-center justify-center space-x-1.5 flex-1 ${
            activeTab === 'cancelled'
              ? 'bg-[#FFF5F0] text-[#E4572E] border border-[#FCDDC9]/60 shadow-[0_2px_4px_rgba(228,87,46,0.05)] font-bold'
              : 'bg-transparent text-[#6B6B6B] border border-transparent font-medium hover:bg-gray-50'
          }`}
        >
          <ArchiveX className="w-[15px] h-[15px]" strokeWidth={2.5} />
          <span>Cancelled ({cancelledRequests.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'active' && (
        <div>
          {activeRequests.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center bg-white rounded-[20px] shadow-sm border border-[#E8E0D8]/80 px-6 mb-6">
              <div className="w-14 h-14 bg-[#FFF5F0] rounded-full flex items-center justify-center mb-3 text-[#E4572E]">
                <PackageOpen className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#1a1a1a] text-base mb-1">No active parcels</h3>
              <p className="text-xs text-[#6B6B6B] max-w-[220px] mb-5 leading-relaxed">
                When you pre-register a parcel or receive a delivery, it will appear here.
              </p>
              <Link href="/parcels/new" className="w-full max-w-[180px]">
                <PrimaryButton className="py-2.5 text-xs font-bold">Pre-Register Box</PrimaryButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {activeRequests.map((request) => {
                const reqDateObj = new Date(request.createdAt);
                const expDateObj = new Date(request.expectedDate);

                return (
                  <DetailCard
                    key={request.id}
                    onClick={() => handleCardClick(request)}
                    className="relative group cursor-pointer border border-[#E8E0D8]/60 p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] bg-white rounded-[20px]"
                  >
                    {/* SECTION B: Badge row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-[#FFF4ED] text-[#E4572E] flex items-center space-x-1.5 px-2.5 py-[5px] rounded-[6px] text-[10px] font-bold tracking-wider uppercase">
                        <Clock className="w-[12px] h-[12px]" strokeWidth={2.5} />
                        <span>{request.status.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-[12px] text-[#6B6B6B]">
                        Requested on{' '}
                        {reqDateObj.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* SECTION B: Logo / Name row */}
                    <div className="flex items-center space-x-3.5 mb-2">
                      <div className="w-[52px] h-[52px] flex items-center justify-center shrink-0 border border-[#E8E0D8]/60 bg-white rounded-[14px] shadow-sm overflow-hidden">
                        <PlatformIcon platform={request.platform} size="md" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="font-bold text-[#1a1a1a] text-[17px] leading-tight mb-0.5">
                          {request.platform}
                        </h3>
                        <div className="text-[12px] text-[#6B6B6B]">
                          Order ID ending with <span className="font-bold text-[#1a1a1a]">{request.orderLast4}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-[#FFF5F0] border border-[#FCDDC9]/60 px-[14px] py-1.5 rounded-[14px] text-center">
                        <span className="text-[11px] font-medium text-[#E4572E] mb-0.5">
                          Expected
                        </span>
                        <span className="text-[13px] font-bold text-[#E4572E]">
                          {expDateObj.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* SECTION C: Detail grid */}
                    <div className="mt-4 mb-4 grid grid-cols-3 gap-1 py-3.5 border-t border-b border-[#F0EAE4]">
                      <div className="flex flex-col pl-1">
                        <div className="flex items-center space-x-1.5 mb-1 text-[#E4572E]">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="text-[11px] text-[#1a1a1a]">
                            Expected Date
                          </span>
                        </div>
                        <span className="text-[13px] font-bold text-[#1a1a1a]">
                          {expDateObj.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col px-1">
                        <div className="flex items-center space-x-1.5 mb-1 text-[#E4572E]">
                          <Package className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="text-[11px] text-[#1a1a1a]">
                            Collection Type
                          </span>
                        </div>
                        <span
                          className={`text-[13px] font-semibold ${
                            request.collectionType === 'can_be_stored'
                              ? 'text-[#2E7D4F]'
                              : 'text-[#C0392B]'
                          }`}
                        >
                          {request.collectionType === 'can_be_stored'
                            ? 'Can be stored'
                            : 'Immediate'}
                        </span>
                      </div>
                      <div className="flex flex-col pr-1">
                        <div className="flex items-center space-x-1.5 mb-1 text-[#E4572E]">
                          <Hash className="w-[14px] h-[14px]" strokeWidth={2} />
                          <span className="text-[11px] text-[#1a1a1a]">
                            Parcel Number
                          </span>
                        </div>
                        <span className="text-[13px] text-[#6B6B6B]">
                          Not assigned yet
                        </span>
                      </div>
                    </div>

                    {/* SECTION D: Info callout */}
                    {request.status === 'pending' && (
                      <div className="bg-[#FFF5F0] border border-[#FCDDC9]/60 rounded-xl p-[14px] mb-5 flex items-start space-x-3 shadow-xs">
                        <div className="text-[#E4572E] shrink-0 mt-0.5">
                          <Info className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-[13px] font-bold text-[#1a1a1a]">
                            Waiting for parcel to arrive
                          </h4>
                          <p className="text-[12px] text-[#6B6B6B] leading-relaxed mt-0.5">
                            We'll notify you as soon as your parcel arrives at Gate No. 2.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SECTION D: Button */}
                    <div className="w-full">
                      <button className="w-full flex items-center justify-center space-x-2 py-[14px] rounded-[14px] border-[1.5px] border-[#E4572E] text-[#E4572E] font-bold text-[13px] hover:bg-[#FFF5F0] transition-colors">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </DetailCard>
                );
              })}
            </div>
          )}

          {/* Unmatched Parcels Search Link */}
          <div className="bg-white border border-[#E8E0D8]/80 rounded-2xl p-4 shadow-xs mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-[#1a1a1a] text-[14px]">Don't see your parcel?</h3>
                <p className="text-[12px] text-[#6B6B6B]">Search items delivered without pre-registration.</p>
              </div>
              <Link
                href="/parcels/unmatched"
                className="inline-flex items-center gap-1.5 bg-[#FFF4ED] text-[#E4572E] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#FFE8DC] transition-colors"
              >
                <span>Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SECTION E: Collected History Section */}
          {collectedRequests.length > 0 && (
            <div className="mt-8 mb-6">
              <h3 className="font-bold text-[#1a1a1a] text-[15px] mb-3.5">Collected History</h3>
              <div className="space-y-3">
                {collectedRequests.map((req) => renderCompactCard(req, 'collected'))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'collected' && (
        <div>
          {collectedRequests.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-[#E8E0D8]/80 px-6">
              <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-3 text-[#2E7D4F]">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#1a1a1a] text-base mb-1">No collected parcels</h3>
              <p className="text-xs text-[#6B6B6B] max-w-[220px] leading-relaxed">
                Parcels you have picked up will be shown here for your records.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {collectedRequests.map((req) => renderCompactCard(req, 'collected'))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cancelled' && (
        <div>
          {cancelledRequests.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-[#E8E0D8]/80 px-6">
              <div className="w-14 h-14 bg-[#FFF5F0] rounded-full flex items-center justify-center mb-3 text-[#E4572E]">
                <ArchiveX className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#1a1a1a] text-base mb-1">No cancelled requests</h3>
              <p className="text-xs text-[#6B6B6B] max-w-[220px] leading-relaxed">
                Requests you cancel before arrival will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cancelledRequests.map((req) => renderCompactCard(req, 'cancelled'))}
            </div>
          )}
        </div>
      )}

      {/* SECTION E: Need Help? Callout Card */}
      <div className="mt-8">
        <div className="bg-[#FFF5F0] border border-[#FCDDC9]/60 rounded-2xl p-[18px] flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3.5 pr-2">
            <div className="w-8 h-8 flex items-center justify-center text-[#1a1a1a] shrink-0">
              <Headphones className="w-[26px] h-[26px] stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] text-[15px]">Need help?</h3>
              <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                Reach out to the help centre for any assistance.
              </p>
            </div>
          </div>
          <Link href="mailto:support@rishihood.edu.in" className="shrink-0">
            <button className="bg-[#E4572E] hover:bg-[#D04820] text-white font-bold text-[13px] px-4 py-[11px] rounded-[12px] shadow-sm transition-colors whitespace-nowrap">
              Help Centre
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
