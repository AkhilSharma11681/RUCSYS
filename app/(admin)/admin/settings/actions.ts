'use server';

import { auth } from '@/auth';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { revalidatePath } from 'next/cache';

export async function updateCapacityConfigAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    throw new Error('Forbidden');
  }

  const maxCapacity = parseInt(formData.get('maxCapacity') as string, 10);
  const pauseNewRequestsAtPct = parseInt(formData.get('pauseNewRequestsAtPct') as string, 10);
  const reminderAfterDays = parseInt(formData.get('reminderAfterDays') as string, 10);
  const notifyAfterDays = parseInt(formData.get('notifyAfterDays') as string, 10);
  const callAfterDays = parseInt(formData.get('callAfterDays') as string, 10);
  const deadlineAfterDays = parseInt(formData.get('deadlineAfterDays') as string, 10);

  // Validate all are positive integers
  if (
    isNaN(maxCapacity) || maxCapacity <= 0 ||
    isNaN(pauseNewRequestsAtPct) ||
    isNaN(reminderAfterDays) || reminderAfterDays <= 0 ||
    isNaN(notifyAfterDays) || notifyAfterDays <= 0 ||
    isNaN(callAfterDays) || callAfterDays <= 0 ||
    isNaN(deadlineAfterDays) || deadlineAfterDays <= 0
  ) {
    return { success: false, error: 'All fields must be valid positive integers.' };
  }

  // Validate percentage
  if (pauseNewRequestsAtPct < 0 || pauseNewRequestsAtPct > 100) {
    return { success: false, error: 'Pause threshold percentage must be between 0 and 100.' };
  }

  // Validate strictly ascending days
  if (
    reminderAfterDays >= notifyAfterDays ||
    notifyAfterDays >= callAfterDays ||
    callAfterDays >= deadlineAfterDays
  ) {
    return {
      success: false,
      error: 'Escalation thresholds must be strictly ascending (Reminder < Notify < Call < Deadline).',
    };
  }

  try {
    const repo = new CapacityConfigRepository();
    await repo.updateConfig({
      maxCapacity,
      pauseNewRequestsAtPct,
      reminderAfterDays,
      notifyAfterDays,
      callAfterDays,
      deadlineAfterDays,
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err) {
    console.error('Failed to update config:', err);
    return { success: false, error: 'Internal server error while saving config.' };
  }
}
