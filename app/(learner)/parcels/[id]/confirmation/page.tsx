import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { DetailCard } from '@/components/DetailCard';
import { DetailGrid } from '@/components/DetailGrid';
import { StepExplainer } from '@/components/StepExplainer';
import { CapacityCallout } from '@/components/CapacityCallout';
import { OutlineButton } from '@/components/Buttons';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { notFound } from 'next/navigation';

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestRepo = new ParcelRequestRepository();
  const request = await requestRepo.findById(id);
  if (!request) notFound();

  const parcelRepo = new ParcelRepository();
  const currentPackages = await parcelRepo.countActive();

  return (
    <div className="p-4 max-w-md mx-auto">
      <DetailCard className="mb-5 bg-[#E8F5E9] border-[#2E7D4F]/20 flex items-start space-x-3">
        <CheckCircle className="w-6 h-6 text-[#2E7D4F] shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-[#1a1a1a] text-base mb-0.5">Parcel Request Submitted!</h2>
          <p className="text-sm text-[#6B6B6B]">We'll notify you once your parcel arrives at Gate No. 2.</p>
        </div>
      </DetailCard>

      <DetailCard className="mb-5">
        <PageIntro title="Your Parcel Details" subtitle="" className="mb-3" />
        <DetailGrid
          columns={2}
          items={[
            { label: 'Expected Delivery Date', value: new Date(request.expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Platform', value: request.platform },
            { label: 'Last 4 Digits of Order ID', value: request.orderLast4 },
            { label: 'Collection Type', value: request.collectionType === 'can_be_stored' ? 'Can be stored' : 'Immediate collection' },
          ]}
        />
      </DetailCard>

      <CapacityCallout currentPackages={currentPackages} label="Store Room Capacity" className="mb-5" />

      <DetailCard className="mb-5">
        <h3 className="font-bold text-[#1a1a1a] text-sm mb-4">What happens next?</h3>
        <StepExplainer
          orientation="vertical"
          steps={[
            { title: '1. Parcel Arrives', description: 'Our team will verify and store your parcel.' },
            { title: "2. You'll Get Notified", description: "You'll receive a notification when it's ready for pickup." },
            { title: '3. Collect with OTP', description: 'Show the OTP at Gate No. 2 and collect your parcel.' },
          ]}
        />
      </DetailCard>

      <Link href="/parcels">
        <OutlineButton>View My Requests</OutlineButton>
      </Link>
    </div>
  );
}