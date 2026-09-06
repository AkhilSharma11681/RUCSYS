'use server';
import { auth } from '@/auth';
import { ParcelRequestService } from '@/lib/services/ParcelRequestService';

export async function createParcelRequest(data: {
  platform: string;
  orderLast4: string;
  expectedDate: string;
  collectionType: 'can_be_stored' | 'immediate';
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'learner') {
    return { success: false as const, error: 'Not authenticated as a learner.' };
  }
  const studentId = (session.user as any).id as string;
  const service = new ParcelRequestService();
  return service.createRequest({ studentId, ...data });
}
