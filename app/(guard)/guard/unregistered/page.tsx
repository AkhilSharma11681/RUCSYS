import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { UnregisteredParcelsClientPage } from './ClientPage';

export default async function UnregisteredParcelsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    redirect('/login');
  }

  const parcelRepo = new ParcelRepository();
  const rawParcels = await parcelRepo.getUnregisteredParcels();

  const formattedParcels = rawParcels.map(p => {
    // Parse out platform/recipient from the label note if possible
    // Default format recorded is "[Unregistered] Recipient: {name} | Platform: {platform} | Order: {order}"
    let platform = 'Unknown';
    let labelNotes = p.notes || '';

    if (labelNotes.includes('Platform: ')) {
      const match = labelNotes.match(/Platform:\s*([^|]+)/);
      if (match && match[1]) {
        platform = match[1].trim();
      }
    }

    return {
      id: p.id,
      parcelNumber: p.parcelNumber,
      storageLocation: p.storageLocation,
      arrivedAt: p.arrivedAt ? p.arrivedAt.toISOString() : new Date().toISOString(),
      platform,
      notes: p.notes || 'Unmatched parcel',
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <UnregisteredParcelsClientPage initialParcels={formattedParcels} />
    </div>
  );
}
