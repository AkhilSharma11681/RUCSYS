import { count, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels } from '@/lib/db/schema';

export class ParcelRepository {
  async countActive(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(parcels)
      .where(isNull(parcels.collectedAt));

    return result.count;
  }
}
