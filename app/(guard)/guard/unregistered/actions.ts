'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { parcelRequests, students } from '@/lib/db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { OtpService } from '@/lib/services/OtpService';
import { revalidatePath } from 'next/cache';

export async function searchPendingRequestsAction(query: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized', data: [] };
  }
  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  if (!query || query.trim().length < 2) {
    return { success: true, data: [] };
  }

  const searchTerm = `%${query.trim()}%`;
  const results = await db
    .select({
      id: parcelRequests.id,
      platform: parcelRequests.platform,
      orderLast4: parcelRequests.orderLast4,
      studentName: students.fullName,
      studentEmail: students.email,
      expectedDate: parcelRequests.expectedDate,
    })
    .from(parcelRequests)
    .innerJoin(students, eq(parcelRequests.studentId, students.id))
    .where(
      and(
        eq(parcelRequests.status, 'pending'),
        or(
          ilike(students.fullName, searchTerm),
          ilike(students.email, searchTerm),
          ilike(parcelRequests.orderLast4, searchTerm)
        )
      )
    )
    .limit(10);

  return { success: true, data: results };
}

export async function linkUnregisteredParcelAction(parcelId: string, requestId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const role = (session.user as any).role;
    if (role !== 'guard' && role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const parcelRepo = new ParcelRepository();
    const otpService = new OtpService();

    await db.transaction(async (tx) => {
      // 1. Link parcel
      await tx
        .update(parcelRequests)
        .set({ status: 'ready_for_pickup' })
        .where(eq(parcelRequests.id, requestId));

      await parcelRepo.linkToRequest(parcelId, requestId);
    });

    // 2. Generate OTP for pickup
    await otpService.generate(parcelId);

    revalidatePath('/guard/unregistered');
    revalidatePath('/guard');
    revalidatePath('/parcels');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to link unregistered parcel:', err);
    return { success: false, error: err.message || 'Failed to link parcel' };
  }
}
