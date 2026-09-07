import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { capacityConfig } from '@/lib/db/schema';

export class CapacityConfigRepository {
  async getConfig() {
    const [config] = await db
      .select()
      .from(capacityConfig)
      .where(eq(capacityConfig.id, 1));

    if (!config) {
      return {
        id: 1,
        maxCapacity: 100,
        pauseNewRequestsAtPct: 90,
        reminderAfterDays: 3,
        notifyAfterDays: 5,
        callAfterDays: 7,
        deadlineAfterDays: 10,
        updatedAt: new Date(),
      };
    }

    return config;
  }

  async updateConfig(data: Partial<Omit<typeof capacityConfig.$inferInsert, 'id'>>) {
    const [result] = await db
      .update(capacityConfig)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(capacityConfig.id, 1))
      .returning();

    if (!result) {
      const [newRow] = await db
        .insert(capacityConfig)
        .values({ ...data, id: 1, updatedAt: new Date() })
        .returning();
      return newRow;
    }

    return result;
  }
}
