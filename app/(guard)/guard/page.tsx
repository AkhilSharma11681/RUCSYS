import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { GuardDashboardClient } from './ClientPage';
import { CollectionType } from '@/lib/types';

export default async function GuardDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    redirect('/login');
  }

  const parcelRequestRepo = new ParcelRequestRepository();
  const parcelRepo = new ParcelRepository();
  const capacityRepo = new CapacityConfigRepository();

  const [
    capacityConfig,
    activeCount,
    pendingCount,
    readyCount,
    overdueCount,
    rawInitialPending,
    rawReadySummary,
    rawOverdueSummary,
  ] = await Promise.all([
    capacityRepo.getConfig(),
    parcelRepo.countActive(),
    parcelRequestRepo.countByStatus('pending'),
    parcelRequestRepo.countByStatus('ready_for_pickup'),
    parcelRequestRepo.countByStatus('overdue'),
    parcelRequestRepo.searchPending(''),
    parcelRequestRepo.getReadyForPickupSummary(5),
    parcelRequestRepo.getOverdueSummary(5),
  ]);

  const initialPending = rawInitialPending.map((r) => ({
    id: r.id,
    platform: r.platform,
    orderLast4: r.orderLast4,
    collectionType: r.collectionType as CollectionType,
    expectedDate: String(r.expectedDate),
    studentName: r.studentName || 'Unknown Student',
  }));

  const readySummary = rawReadySummary.map((r) => ({
    id: r.id,
    platform: r.platform,
    orderLast4: r.orderLast4,
    studentName: r.studentName || 'Unknown Student',
  }));

  const overdueSummary = rawOverdueSummary.map((r) => ({
    id: r.id,
    platform: r.platform,
    orderLast4: r.orderLast4,
    studentName: r.studentName || 'Unknown Student',
  }));

  return (
    <GuardDashboardClient
      capacity={{
        active: activeCount,
        max: capacityConfig.maxCapacity,
      }}
      stats={{
        pending: pendingCount,
        stored: activeCount,
        readyForPickup: readyCount,
        overdue: overdueCount,
      }}
      initialPending={initialPending}
      readySummary={readySummary}
      overdueSummary={overdueSummary}
    />
  );
}
