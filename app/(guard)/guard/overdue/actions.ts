'use server';

import { auth } from '@/auth';
import { EscalationService } from '@/lib/services/EscalationService';
import { revalidatePath } from 'next/cache';

export async function logCallAction(parcelId: string) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    return { success: false, error: 'Forbidden. Guard or admin access required.' };
  }

  if (!parcelId) {
    return { success: false, error: 'Parcel ID is required.' };
  }

  try {
    const escalationService = new EscalationService();
    await escalationService.logManualCall(parcelId);

    revalidatePath('/guard/overdue');
    revalidatePath('/guard');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to log call stage.',
    };
  }
}
