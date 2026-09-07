'use server';

import { auth } from '@/auth';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function storeUnregisteredParcelAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const role = (session.user as any).role;
  const guardId = (session.user as any).id;

  if (role !== 'guard' && role !== 'admin') {
    return { success: false, error: 'Forbidden' };
  }

  const recipientName = formData.get('recipientName')?.toString()?.trim();
  const platform = formData.get('platform')?.toString()?.trim();
  const orderId = formData.get('orderId')?.toString()?.trim();
  const parcelNumberStr = formData.get('parcelNumber')?.toString()?.trim();
  const storageLocation = formData.get('storageLocation')?.toString()?.trim();
  const additionalNotes = formData.get('notes')?.toString()?.trim();

  if (!recipientName || !platform || !parcelNumberStr || !storageLocation) {
    return { success: false, error: 'Recipient name, platform, parcel number, and storage location are required.' };
  }

  const parcelNumber = parseInt(parcelNumberStr, 10);
  if (isNaN(parcelNumber)) {
    return { success: false, error: 'Invalid parcel number' };
  }

  // Format notes to preserve all label metadata on the unlinked parcel
  const orderInfo = orderId ? ` | Order: ${orderId}` : '';
  const extraNotes = additionalNotes ? ` | Note: ${additionalNotes}` : '';
  const formattedNotes = `[Unregistered] Recipient: ${recipientName} | Platform: ${platform}${orderInfo}${extraNotes}`;

  const parcelRepo = new ParcelRepository();

  try {
    await parcelRepo.createParcel({
      requestId: null,
      guardId,
      parcelNumber,
      storageLocation,
      notes: formattedNotes,
      isUnregistered: true,
    });
  } catch (error: any) {
    console.error('Failed to store unregistered parcel:', error);
    return { success: false, error: error?.message || 'Failed to save unregistered parcel.' };
  }

  revalidatePath('/guard');
  revalidatePath('/guard/unregistered');
  redirect('/guard/unregistered');
}
