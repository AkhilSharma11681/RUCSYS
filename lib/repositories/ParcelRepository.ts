import { count, isNull, desc, eq, isNotNull, and, or, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels, parcelRequests, students } from '@/lib/db/schema';

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
    requestId: string | null;
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

  async searchAwaitingCollection(query: string = '') {
    const baseQuery = db
      .select({
        id: parcels.id,
        parcelNumber: parcels.parcelNumber,
        storageLocation: parcels.storageLocation,
        isUnregistered: parcels.isUnregistered,
        arrivedAt: parcels.arrivedAt,
        otpAttempts: parcels.otpAttempts,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        collectionType: parcelRequests.collectionType,
        status: parcelRequests.status,
        studentName: students.fullName,
      })
      .from(parcels)
      .leftJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id))
      .leftJoin(students, eq(parcelRequests.studentId, students.id));

    if (!query || query.trim() === '') {
      return await baseQuery
        .where(isNull(parcels.collectedAt))
        .orderBy(desc(parcels.arrivedAt));
    }

    const searchTerm = `%${query.trim()}%`;
    const isNumeric = /^\d+$/.test(query.trim());
    const numericVal = isNumeric ? parseInt(query.trim(), 10) : null;

    const conditions = [
      ilike(parcelRequests.orderLast4, searchTerm),
      ilike(parcelRequests.platform, searchTerm),
      ilike(students.fullName, searchTerm),
    ];

    if (numericVal !== null) {
      conditions.push(eq(parcels.parcelNumber, numericVal));
    }

    return await baseQuery
      .where(
        and(
          isNull(parcels.collectedAt),
          or(...conditions)
        )
      )
      .orderBy(desc(parcels.arrivedAt));
  }

  async getOverdueParcels() {
    return await db
      .select({
        id: parcels.id,
        parcelNumber: parcels.parcelNumber,
        storageLocation: parcels.storageLocation,
        arrivedAt: parcels.arrivedAt,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        studentName: students.fullName,
      })
      .from(parcels)
      .innerJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id))
      .leftJoin(students, eq(parcelRequests.studentId, students.id))
      .where(
        and(
          isNull(parcels.collectedAt),
          eq(parcelRequests.status, 'overdue')
        )
      )
      .orderBy(parcels.arrivedAt);
  }

  async getUnregisteredParcels() {
    return await db
      .select({
        id: parcels.id,
        parcelNumber: parcels.parcelNumber,
        storageLocation: parcels.storageLocation,
        arrivedAt: parcels.arrivedAt,
        notes: parcels.notes,
        isUnregistered: parcels.isUnregistered,
      })
      .from(parcels)
      .where(
        and(
          isNull(parcels.collectedAt),
          eq(parcels.isUnregistered, true)
        )
      )
      .orderBy(desc(parcels.arrivedAt));
  }

  async linkToRequest(parcelId: string, requestId: string) {
    const [updated] = await db
      .update(parcels)
      .set({
        requestId,
        isUnregistered: false,
      })
      .where(eq(parcels.id, parcelId))
      .returning();

    return updated;
  }
}

