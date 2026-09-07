import { count, isNull, desc, eq, isNotNull } from 'drizzle-orm';
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

  async getNextAvailableNumbers(requestedCount: number): Promise<number[]> {
    const activeRecords = await db
      .select({ parcelNumber: parcels.parcelNumber })
      .from(parcels)
      .where(isNull(parcels.collectedAt));

    const activeNumbers = new Set(activeRecords.map(r => r.parcelNumber));
    const available: number[] = [];

    let current = 1;
    while (available.length < requestedCount) {
      if (!activeNumbers.has(current)) {
        available.push(current);
      }
      current++;
    }

    return available;
  }

  async getMostRecentStorageLocation(): Promise<string | null> {
    const [result] = await db
      .select({ storageLocation: parcels.storageLocation })
      .from(parcels)
      .where(isNotNull(parcels.storageLocation))
      .orderBy(desc(parcels.arrivedAt))
      .limit(1);

    return result?.storageLocation || null;
  }

  async findByRequestId(requestId: string) {
    const [result] = await db
      .select()
      .from(parcels)
      .where(eq(parcels.requestId, requestId))
      .limit(1);

    return result || null;
  }

  async createParcel(data: {
    requestId: string;
    guardId: string;
    parcelNumber: number;
    storageLocation: string;
    notes?: string;
    isUnregistered: boolean;
  }) {
    const [result] = await db
      .insert(parcels)
      .values({
        requestId: data.requestId,
        guardId: data.guardId,
        parcelNumber: data.parcelNumber,
        storageLocation: data.storageLocation || null,
        notes: data.notes || null,
        isUnregistered: data.isUnregistered,
      })
      .returning();

    return result;
  }
}
