import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { EscalationService } from '@/lib/services/EscalationService';
import { OverdueParcelsClient, OverdueParcelItem } from './ClientPage';
import { EscalationStage } from '@/lib/types';

export default async function GuardOverduePage() {
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
  const escalationService = new EscalationService();

  const [config, rawOverdueParcels] = await Promise.all([
    capacityRepo.getConfig(),
    parcelRepo.getOverdueParcels(),
  ]);

  const parcelIds = rawOverdueParcels.map((p) => p.id);
  const stagesByParcelId = await escalationService.getStagesForParcels(parcelIds);

  const nowMs = Date.now();
  const overdueParcels: OverdueParcelItem[] = rawOverdueParcels.map((p) => {
    const arrivedAtMs = p.arrivedAt ? new Date(p.arrivedAt).getTime() : nowMs;
    const daysSinceArrival = Math.floor((nowMs - arrivedAtMs) / (1000 * 60 * 60 * 24));
    const daysOverdue = Math.max(0, daysSinceArrival - config.notifyAfterDays);

    return {
      id: p.id,
      parcelNumber: p.parcelNumber,
      storageLocation: p.storageLocation,
      arrivedAt: p.arrivedAt ? new Date(p.arrivedAt).toISOString() : new Date().toISOString(),
      platform: p.platform || 'Unknown',
      orderLast4: p.orderLast4 || 'N/A',
      studentName: p.studentName || 'Unregistered',
      daysOverdue: daysOverdue > 0 ? daysOverdue : daysSinceArrival,
      stages: stagesByParcelId.get(p.id) || [],
    };
  });

  return (
    <OverdueParcelsClient
      initialParcels={overdueParcels}
      notifyThresholdDays={config.notifyAfterDays}
    />
  );
}
