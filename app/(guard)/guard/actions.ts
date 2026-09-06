'use server';

import { auth } from '@/auth';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';

export async function searchPendingAction(query: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    throw new Error('Forbidden');
  }

  const repo = new ParcelRequestRepository();
  const results = await repo.searchPending(query);

  return results.map((r) => ({
    ...r,
    expectedDate: String(r.expectedDate),
    studentName: r.studentName || 'Unknown Student',
  }));
}
