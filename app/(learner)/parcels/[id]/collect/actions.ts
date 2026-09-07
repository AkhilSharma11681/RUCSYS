'use server';

import { auth } from '@/auth';
import { OtpService } from '@/lib/services/OtpService';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { revalidatePath } from 'next/cache';

export async function regenerateOtpAction(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'learner') {
      return { success: false, error: 'Unauthorized' };
    }

    const requestRepo = new ParcelRequestRepository();
    const request = await requestRepo.findById(requestId);

    if (!request || request.studentId !== (session.user as any).id) {
      return { success: false, error: 'Parcel request not found' };
    }

    if (request.status !== 'ready_for_pickup' && request.status !== 'overdue') {
      return { success: false, error: 'Parcel is not ready for pickup' };
    }

    const parcelRepo = new ParcelRepository();
    const parcel = await parcelRepo.findByRequestId(requestId);

    if (!parcel) {
      return { success: false, error: 'Parcel not found' };
    }

    const otpService = new OtpService();
    await otpService.generate(parcel.id);

    // Revalidate the page so it picks up the new regenerated OTP.
    revalidatePath(`/parcels/${requestId}/collect`);

    return { success: true };
  } catch (err: any) {
    console.error('Error regenerating OTP:', err);
    return { success: false, error: 'Failed to regenerate code.' };
  }
}
