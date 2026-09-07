import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DetailCard } from '@/components/DetailCard';
import { OutlineButton } from '@/components/Buttons';
import { IllustratedBox } from '@/components/IllustratedBox';
import { PlatformIcon } from '@/components/PlatformIcon';
import { StatusPill } from '@/components/StatusPill';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { Calendar, Hash, Package } from 'lucide-react';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // If parcel is already ready or overdue, A5 is the correct view for the learner
  if (request.status === 'ready_for_pickup' || request.status === 'overdue') {
    redirect(`/parcels/${id}/collect`);
  }

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1] pb-24 pt-6">
      {request.status === 'pending' && (
        <DetailCard className="mb-6 bg-[#FFF5F0] border border-[#FCDDC9]/60 p-0 overflow-hidden relative shadow-sm">
          <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
            <IllustratedBox variant="sealed" size={60} className="shrink-0 -ml-1 -my-1" />
            <div className="pr-2">
              <h2 className="font-bold text-[#1a1a1a] text-[16px] leading-tight mb-1">
                Waiting for arrival
              </h2>
              <p className="text-[13px] text-[#6B6B6B] font-medium leading-relaxed">
                Waiting for parcel to arrive at Gate No. 2.
              </p>
            </div>
          </div>
        </DetailCard>
      )}

      {request.status === 'arrived' && (
        <DetailCard className="mb-6 bg-[#E8F5E9] border-transparent p-0 overflow-hidden relative shadow-sm">
          <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
            <IllustratedBox variant="sealed" size={60} className="shrink-0 -ml-1 -my-1" />
            <div className="pr-2">
              <h2 className="font-bold text-[#1a1a1a] text-[16px] leading-tight mb-1">
                Parcel Arrived!
              </h2>
              <p className="text-[13px] text-[#2E7D4F] font-medium leading-relaxed">
                Your parcel has arrived at Gate No. 2 and is currently being processed by the guard.
              </p>
            </div>
          </div>
        </DetailCard>
      )}

      {request.status === 'cancelled' && (
        <DetailCard className="mb-6 bg-[#FDECEA] border-transparent p-0 overflow-hidden relative shadow-sm">
          <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
            <div className="pr-2">
              <h2 className="font-bold text-[#C0392B] text-[16px] leading-tight mb-1">
                Request Cancelled
              </h2>
              <p className="text-[13px] text-[#C0392B]/80 font-medium leading-relaxed">
                This parcel request has been cancelled.
              </p>
            </div>
          </div>
        </DetailCard>
      )}

      {request.status === 'collected' && (
        <DetailCard className="mb-6 bg-[#E8F5E9] border-transparent p-0 overflow-hidden relative shadow-sm">
          <div className="flex flex-row items-center p-5 space-x-4 relative z-10">
            <IllustratedBox variant="success" size={60} className="shrink-0 -ml-1 -my-1" />
            <div className="pr-2">
              <h2 className="font-bold text-[#2E7D4F] text-[16px] leading-tight mb-1">
                Already Collected
              </h2>
              <p className="text-[13px] text-[#2E7D4F]/80 font-medium leading-relaxed">
                You have already collected this parcel.
              </p>
            </div>
          </div>
        </DetailCard>
      )}

      <DetailCard className="mb-8">
        <h3 className="font-bold text-[#1a1a1a] text-[16px] mb-5">Parcel Details</h3>

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

      <Link href="/parcels" className="block w-full">
        <OutlineButton className="w-full py-4 font-bold text-[15px]">View My Requests</OutlineButton>
      </Link>
    </div>
  );
}
