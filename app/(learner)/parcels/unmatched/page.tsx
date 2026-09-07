import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { UnmatchedSearchClientPage } from './ClientPage';

export default async function UnmatchedParcelsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'learner') {
    redirect('/login');
  }

  const parcelRepo = new ParcelRepository();
  const rawParcels = await parcelRepo.getUnregisteredParcels();

  // For safety, don't expose full names from notes to all learners, just the platform and parcel number/arrivedAt.
  // Actually, we can return the platform and the last 4 if we parse it, but for a simple search by the learner,
  // we pass the basic details and let the client filter.
  // To avoid data leakage, we parse out the platform and order id.
  const formattedParcels = rawParcels.map(p => {
    let platform = 'Unknown';
    let orderId = '';
    let labelNotes = p.notes || '';

    if (labelNotes.includes('Platform: ')) {
      const match = labelNotes.match(/Platform:\s*([^|]+)/);
      if (match && match[1]) platform = match[1].trim();
    }

    if (labelNotes.includes('Order: ')) {
      const match = labelNotes.match(/Order:\s*([^|]+)/);
      if (match && match[1]) orderId = match[1].trim();
    }

    return {
      id: p.id,
      parcelNumber: p.parcelNumber,
      platform,
      orderId, // We will use this to match against user input, but not show it fully until matched? Wait, we can just let them search.
      arrivedAt: p.arrivedAt ? p.arrivedAt.toISOString() : new Date().toISOString(),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <UnmatchedSearchClientPage initialParcels={formattedParcels} />
    </div>
  );
}
