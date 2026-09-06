'use server';

import { auth } from '@/auth';
import { ParcelRequestService } from '@/lib/services/ParcelRequestService';
import { revalidatePath } from 'next/cache';

export async function cancelParcelRequest(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'learner') {
    return { success: false as const, error: 'Not authenticated as a learner.' };
  }

  const studentId = (session.user as any).id as string;
  const service = new ParcelRequestService();

  const result = await service.cancelRequest(id, studentId);

  if (result.success) {
    revalidatePath('/parcels');
  }

  return result;
}
