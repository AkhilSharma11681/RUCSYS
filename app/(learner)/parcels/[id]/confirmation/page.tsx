import Link from 'next/link';
import { DetailCard } from '@/components/DetailCard';
import { StepExplainer } from '@/components/StepExplainer';
import { CapacityCallout } from '@/components/CapacityCallout';
import { OutlineButton } from '@/components/Buttons';
import { IllustratedBox } from '@/components/IllustratedBox';
import { PlatformIcon } from '@/components/PlatformIcon';
import { StatusPill } from '@/components/StatusPill';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { notFound } from 'next/navigation';
import { Calendar, Hash, Package, Bell, ShieldCheck } from 'lucide-react';

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestRepo = new ParcelRequestRepository();
  const request = await requestRepo.findById(id);
  if (!request) notFound();

  const parcelRepo = new ParcelRepository();
  const currentPackages = await parcelRepo.countActive();

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1] pb-24 pt-6">
      {/* Green Success Banner */}
      <DetailCard className="mb-6 bg-[#E8F5E9] border-transparent p-0 overflow-hidden relative shadow-sm">
        <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
          <IllustratedBox variant="success" size={64} className="shrink-0 -ml-1 -my-1" />
          <div className="pr-2">
            <h2 className="font-bold text-[#1a1a1a] text-[17px] leading-tight mb-1">
              Parcel Request Submitted!
            </h2>
            <p className="text-[13px] text-[#2E7D4F] font-medium leading-relaxed">
              We'll notify you once your parcel arrives at Gate No. 2.
            </p>
          </div>
        </div>
      </DetailCard>

      <DetailCard className="mb-6">
        <h3 className="font-bold text-[#1a1a1a] text-[16px] mb-5">Your Parcel Details</h3>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#E8E0D8]/40">
            <div className="flex items-center space-x-2 text-[#6B6B6B]">
              <Calendar className="w-4 h-4" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Expected Delivery Date</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">
              {new Date(request.expectedDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

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

      <div className="mb-6">
        <CapacityCallout currentPackages={currentPackages} label="Store Room Capacity" />
      </div>

      <DetailCard className="mb-8">
        <h3 className="font-bold text-[#1a1a1a] text-[15px] mb-5">What happens next?</h3>
        <StepExplainer
          orientation="vertical"
          steps={[
            {
              title: 'Parcel Arrives',
              description: 'Our team will verify and store your parcel at Gate No. 2.',
              icon: <Package className="w-4 h-4" />
            },
            {
              title: "You'll Get Notified",
              description: "You'll receive a notification when it's ready for pickup.",
              icon: <Bell className="w-4 h-4" />
            },
            {
              title: 'Collect with OTP',
              description: 'Show the 4-digit OTP to the guard and collect your parcel.',
              icon: <ShieldCheck className="w-4 h-4" />
            },
          ]}
        />
      </DetailCard>

      <Link href="/parcels" className="block w-full">
        <OutlineButton className="w-full py-4 font-bold text-[15px]">View My Requests</OutlineButton>
      </Link>
    </div>
  );
}
