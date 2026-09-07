import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { UnregisteredArrivalClientPage } from './ClientPage';
import { AlertTriangle } from 'lucide-react';

export default async function NewUnregisteredArrivalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    redirect('/login');
  }

  const parcelRepo = new ParcelRepository();
  const capacityRepo = new CapacityConfigRepository();

  const [suggestedNumbers, suggestedLocation, activeCount, capacity] = await Promise.all([
    parcelRepo.getNextAvailableNumbers(5),
    parcelRepo.getMostRecentStorageLocation(),
    parcelRepo.countActive(),
    capacityRepo.getConfig(),
  ]);

  const isAlmostFull = activeCount >= (capacity.maxCapacity * capacity.pauseNewRequestsAtPct) / 100;

  return (
    <div className="space-y-6">
      {isAlmostFull && (
        <div className="bg-[#FFF4E5] border border-[#FFD8A8] text-[#D9480F] p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold text-sm">Store Room Almost Full</div>
            <div className="text-xs text-[#862E9C]/80">
              Capacity: {activeCount}/{capacity.maxCapacity} parcels stored.
            </div>
          </div>
        </div>
      )}

      <UnregisteredArrivalClientPage
        suggestedNumbers={suggestedNumbers}
        suggestedLocation={suggestedLocation || ''}
      />
    </div>
  );
}
