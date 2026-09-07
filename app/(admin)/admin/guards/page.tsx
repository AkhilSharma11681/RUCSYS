import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GuardRepository } from '@/lib/repositories/GuardRepository';
import { GuardsManager } from './ClientPage';

export default async function AdminGuardsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    redirect('/login');
  }

  const repo = new GuardRepository();
  const guardsList = await repo.list();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Guard & Gate Management</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Manage system access for physical gate staff at Gate No. 2.
        </p>
      </div>

      <GuardsManager initialGuards={guardsList} />
    </div>
  );
}
