'use server';

import { auth } from '@/auth';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { OtpService } from '@/lib/services/OtpService';
import { redirect } from 'next/navigation';

export async function storeParcelAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const role = (session.user as any).role;
  const guardId = (session.user as any).id;

  if (role !== 'guard' && role !== 'admin') {
    return { success: false, error: 'Forbidden' };
  }

  const requestId = formData.get('requestId')?.toString();
  const parcelNumberStr = formData.get('parcelNumber')?.toString();
  const storageLocation = formData.get('storageLocation')?.toString();
  const notes = formData.get('notes')?.toString();

  if (!requestId || !parcelNumberStr || !storageLocation) {
    return { success: false, error: 'Missing required fields' };
  }

  const parcelNumber = parseInt(parcelNumberStr, 10);
  if (isNaN(parcelNumber)) {
    return { success: false, error: 'Invalid parcel number' };
  }

  const parcelRepo = new ParcelRepository();
  const otpService = new OtpService();

  // 1. Insert Parcel
  const newParcel = await parcelRepo.createParcel({
    requestId,
    guardId,
    parcelNumber,
    storageLocation,
    notes,
    isUnregistered: false,
  });

  // 2. Generate OTP
  await otpService.generate(newParcel.id);

  // 3. Redirect back to dashboard (never wrapped in try-catch in here)
  redirect('/guard');
}
