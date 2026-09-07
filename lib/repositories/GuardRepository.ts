import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { guards } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export interface GuardRecord {
  id: string;
  fullName: string;
  email: string;
  gateNumber: string;
  createdAt: Date;
}

export interface CreateGuardResult {
  guard: GuardRecord;
  plaintextPassword: string;
}

export class GuardRepository {
  async list(): Promise<GuardRecord[]> {
    return await db
      .select({
        id: guards.id,
        fullName: guards.fullName,
        email: guards.email,
        gateNumber: guards.gateNumber,
        createdAt: guards.createdAt,
      })
      .from(guards)
      .orderBy(desc(guards.createdAt));
  }

  async create(data: {
    fullName: string;
    email: string;
    gateNumber?: string;
  }): Promise<CreateGuardResult> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();
    const gateNumber = (data.gateNumber || 'Gate No. 2').trim();

    // Generate random secure password (12 chars alphanumeric + symbols)
    const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    const bytes = crypto.randomBytes(12);
    let plaintextPassword = '';
    for (let i = 0; i < 12; i++) {
      plaintextPassword += charset[bytes[i] % charset.length];
    }

    const passwordHash = await bcrypt.hash(plaintextPassword, 10);

    try {
      const [newGuard] = await db
        .insert(guards)
        .values({
          fullName: cleanName,
          email: cleanEmail,
          passwordHash,
          gateNumber,
        })
        .returning({
          id: guards.id,
          fullName: guards.fullName,
          email: guards.email,
          gateNumber: guards.gateNumber,
          createdAt: guards.createdAt,
        });

      return {
        guard: newGuard,
        plaintextPassword,
      };
    } catch (error: any) {
      if (
        error?.code === '23505' ||
        error?.message?.includes('guards_email_unique') ||
        error?.message?.includes('unique constraint')
      ) {
        throw new Error(`A guard with email "${cleanEmail}" already exists.`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db
      .delete(guards)
      .where(eq(guards.id, id))
      .returning({ id: guards.id });

    return deleted.length > 0;
  }
}
