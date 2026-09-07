import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CollectSearchPlaceholder } from './ClientPage';

export default async function GuardCollectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto min-h-screen bg-[#FBF6F1] pb-24 pt-6">
      <CollectSearchPlaceholder />
    </div>
  );
}
