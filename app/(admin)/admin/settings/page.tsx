import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { SettingsForm } from './ClientPage';

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    redirect('/login');
  }

  const repo = new CapacityConfigRepository();
  const config = await repo.getConfig();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">System Settings</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Configure physical storage limits and overdue parcel escalation timelines.
        </p>
      </div>

      <SettingsForm
        initialConfig={{
          maxCapacity: config.maxCapacity,
          pauseNewRequestsAtPct: config.pauseNewRequestsAtPct,
          reminderAfterDays: config.reminderAfterDays,
          notifyAfterDays: config.notifyAfterDays,
          callAfterDays: config.callAfterDays,
          deadlineAfterDays: config.deadlineAfterDays,
        }}
      />
    </div>
  );
}
