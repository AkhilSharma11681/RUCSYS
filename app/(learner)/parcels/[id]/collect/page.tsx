import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DetailCard } from '@/components/DetailCard';
import { OutlineButton } from '@/components/Buttons';
import { IllustratedBox } from '@/components/IllustratedBox';
import { PlatformIcon } from '@/components/PlatformIcon';
import { StatusPill } from '@/components/StatusPill';
import { OtpDigitDisplay } from '@/components/OtpDigitDisplay';
import { StepExplainer } from '@/components/StepExplainer';
import { ClientRegenerateButton } from './ClientRegenerateButton';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { OtpService } from '@/lib/services/OtpService';
import { Calendar, Hash, Package, Clock, MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';

export default async function RequestCollectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'learner') {
    redirect('/login');
  }

  const { id } = await params;
  const requestRepo = new ParcelRequestRepository();
  const request = await requestRepo.findById(id);

  if (!request) {
    notFound();
  }

  if (request.studentId !== (session.user as any).id) {
    notFound();
  }

  // A5 is only for ready or overdue statuses
  if (request.status !== 'ready_for_pickup' && request.status !== 'overdue') {
    redirect(`/parcels/${id}`);
  }

  const parcelRepo = new ParcelRepository();
  const parcel = await parcelRepo.findByRequestId(id);

  if (!parcel) {
    notFound();
  }

  const otpService = new OtpService();
  const otpCode = await otpService.getPlaintextOtp(parcel.id);

  if (!otpCode) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1] pb-24 pt-6 space-y-6">
      {/* 1. Green Success Banner */}
      <DetailCard className="bg-[#E8F5E9] border-transparent p-0 overflow-hidden relative shadow-sm">
        <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
          <IllustratedBox variant="open" size={60} className="shrink-0 -ml-1 -my-1" />
          <div className="pr-2">
            <h2 className="font-bold text-[#1a1a1a] text-[16px] leading-tight mb-1">
              Your parcel is ready!
            </h2>
            <p className="text-[13px] text-[#2E7D4F] font-medium leading-relaxed">
              Your parcel has arrived at Gate No. 2 and is ready for pickup.
            </p>
          </div>
        </div>
      </DetailCard>

      {/* 2. Parcel Summary Card */}
      <DetailCard>
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D8]/40 mb-4">
          <h3 className="font-bold text-[#1a1a1a] text-[16px]">Parcel Summary</h3>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Parcel #</span>
            <span className="text-2xl font-black text-[#E4572E]">#{parcel.parcelNumber}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#E8E0D8]/40">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <PlatformIcon platform={request.platform} size="sm" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Platform</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">{request.platform}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-[#E8E0D8]/40">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <Hash className="w-4 h-4" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Order ID</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">...{request.orderLast4}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <Package className="w-4 h-4" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Collection Type</span>
            </div>
            <StatusPill
              status={request.collectionType === 'can_be_stored' ? 'can_be_stored' : 'immediate'}
              size="md"
            />
          </div>
        </div>
      </DetailCard>

      {/* 3. Collection OTP Card */}
      <DetailCard>
        <h3 className="font-bold text-[#1a1a1a] text-[16px] mb-5">Collection Code</h3>
        <div className="flex flex-col items-center justify-center mb-6">
          <OtpDigitDisplay code={otpCode} />

          <ClientRegenerateButton requestId={request.id} />
        </div>

        <div className="p-4 bg-[#FFF5F0] border border-[#FCDDC9] rounded-xl">
          <p className="text-xs text-[#E4572E] font-medium leading-relaxed text-center">
            <strong>Security first:</strong> Only share this OTP with the guard at Gate No. 2.
            Rishihood will never ask for your OTP.
          </p>
        </div>
      </DetailCard>

      {/* 4. Arrival Detail Card */}
      <DetailCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1a1a1a] text-[16px]">Arrival Details</h3>
          <span className="text-xs font-semibold text-[#2E7D4F] bg-[#E8F5E9] px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            You can collect anytime
          </span>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#E8E0D8]/40">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <Clock className="w-4 h-4" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Arrived Date & Time</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">
              {new Date(parcel.arrivedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}{' '}
              at{' '}
              {new Date(parcel.arrivedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <MapPin className="w-4 h-4" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Storage Location</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">
              {parcel.storageLocation || 'Reception Area'}
            </span>
          </div>
        </div>
      </DetailCard>

      {/* 5. 3-step collection instructions */}
      <div className="px-1">
        <h3 className="font-bold text-[#1a1a1a] text-[15px] mb-4">How to collect</h3>
        <StepExplainer
          steps={[
            {
              title: 'Go to Gate No. 2',
              description: 'Approach the reception desk during operational hours.'
            },
            {
              title: `State Parcel #${parcel.parcelNumber}`,
              description: 'Tell the guard this number to help them locate it instantly.'
            },
            {
              title: 'Show 4-digit OTP',
              description: 'The guard will ask for the code above to verify ownership.'
            }
          ]}
        />
      </div>

      {/* 6. Navigation Button */}
      <div className="pt-2">
        <Link href="/parcels" className="block w-full">
          <OutlineButton className="w-full py-4 font-bold text-[15px]">View My Parcel Requests</OutlineButton>
        </Link>
      </div>
    </div>
  );
}
