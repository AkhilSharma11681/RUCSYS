'use server';

import { auth } from '@/auth';
import { GuardRepository } from '@/lib/repositories/GuardRepository';
import { revalidatePath } from 'next/cache';

export async function createGuardAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    return { success: false, error: 'Forbidden. Admin access required.' };
  }

  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const gateNumber = (formData.get('gateNumber') as string)?.trim() || 'Gate No. 2';

  if (!fullName) {
    return { success: false, error: 'Full name is required.' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }

  try {
    const repo = new GuardRepository();
    const result = await repo.create({
      fullName,
      email,
      gateNumber,
    });

    revalidatePath('/admin/guards');
    return {
      success: true,
      guard: result.guard,
      plaintextPassword: result.plaintextPassword,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to create guard account.',
    };
  }
}

export async function deleteGuardAction(id: string) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    return { success: false, error: 'Forbidden. Admin access required.' };
  }

  if (!id) {
    return { success: false, error: 'Guard ID is required.' };
  }

  try {
    const repo = new GuardRepository();
    const deleted = await repo.delete(id);

    if (!deleted) {
      return { success: false, error: 'Guard account not found or already deleted.' };
    }

    revalidatePath('/admin/guards');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to delete guard account.',
    };
  }
}
