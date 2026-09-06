import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRequestService } from '@/lib/services/ParcelRequestService';
import { MyParcelsClient } from './ClientPage';

export default async function ParcelsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'learner') {
    redirect('/login');
  }

  const studentId = (session.user as any).id as string;
  const service = new ParcelRequestService();
  const rawRequests = await service.getRequestsByStudentId(studentId);

  // Normalize fields to serializable plain types for the client component
  const requests = rawRequests.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    platform: r.platform,
    orderLast4: r.orderLast4,
    expectedDate: String(r.expectedDate),
    collectionType: r.collectionType as 'can_be_stored' | 'immediate',
    status: r.status as
      | 'pending'
      | 'arrived'
      | 'ready_for_pickup'
      | 'collected'
      | 'cancelled'
      | 'overdue',
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  return <MyParcelsClient requests={requests} />;
}
