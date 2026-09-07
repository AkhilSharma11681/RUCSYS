'use server';

import { auth } from '@/auth';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';

export async function searchAwaitingCollectionAction(query: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    throw new Error('Forbidden');
  }

  const repo = new ParcelRepository();
  const results = await repo.searchAwaitingCollection(query);

  return results.map((r) => ({
    ...r,
    // Convert Dates to ISO strings before passing to client components
    arrivedAt: r.arrivedAt ? r.arrivedAt.toISOString() : null,
    studentName: r.studentName || 'Unknown Student',
  }));
}
