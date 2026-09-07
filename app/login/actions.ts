'use server';

import { isLearnerEmail } from '@/lib/utils';
import { StudentRepository } from '@/lib/repositories/StudentRepository';

export async function registerStudentAction(formData: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  hostelRoom?: string;
}) {
  const cleanEmail = (formData.email || '').toLowerCase().trim();
  const fullName = (formData.fullName || '').trim();
  const password = formData.password || '';

  if (!fullName) {
    return { success: false as const, error: 'Full name is required.' };
  }

  if (!isLearnerEmail(cleanEmail)) {
    return {
      success: false as const,
      error: 'Registration requires a @rishihood.edu.in or @nst.rishihood.edu.in email address.',
    };
  }

  if (password.length < 6) {
    return {
      success: false as const,
      error: 'Password must be at least 6 characters.',
    };
  }

  const studentRepo = new StudentRepository();
  const existing = await studentRepo.findByEmail(cleanEmail);
  if (existing) {
    return {
      success: false as const,
      error: 'An account with this email already exists. Please sign in.',
    };
  }

  try {
    await studentRepo.create({
      fullName,
      email: cleanEmail,
      password,
      phone: formData.phone,
      hostelRoom: formData.hostelRoom,
    });

    return { success: true as const };
  } catch (err: any) {
    return {
      success: false as const,
      error: err?.message || 'Failed to create student account.',
    };
  }
}
