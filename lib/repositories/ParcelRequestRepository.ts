import { eq, desc, and, count, or, ilike } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcelRequests, students } from '@/lib/db/schema';

export class ParcelRequestRepository {
  async create(data: {
    studentId: string;
    platform: string;
    orderLast4: string;
    expectedDate: string;
    collectionType: 'can_be_stored' | 'immediate';
  }) {
    const [result] = await db
      .insert(parcelRequests)
      .values({
        studentId: data.studentId,
        platform: data.platform,
        orderLast4: data.orderLast4,
        expectedDate: data.expectedDate,
        collectionType: data.collectionType,
        status: 'pending',
      })
      .returning();

    return result;
  }

  async findByStudent(studentId: string) {
    return await db
      .select()
      .from(parcelRequests)
      .where(eq(parcelRequests.studentId, studentId))
      .orderBy(desc(parcelRequests.createdAt));
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(parcelRequests)
      .where(eq(parcelRequests.id, id));

    return result || null;
  }

  async cancel(id: string, studentId: string) {
    const [result] = await db
      .update(parcelRequests)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(parcelRequests.id, id),
          eq(parcelRequests.studentId, studentId),
          eq(parcelRequests.status, 'pending')
        )
      )
      .returning();

    return result || null;
  }

  async countByStatus(status: 'pending' | 'ready_for_pickup' | 'overdue'): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(parcelRequests)
      .where(eq(parcelRequests.status, status));

    return result.count;
  }

  async searchPending(query: string = '') {
    if (!query || query.trim() === '') {
      return await db
        .select({
          id: parcelRequests.id,
          platform: parcelRequests.platform,
          orderLast4: parcelRequests.orderLast4,
          collectionType: parcelRequests.collectionType,
          expectedDate: parcelRequests.expectedDate,
          studentName: students.fullName,
        })
        .from(parcelRequests)
        .leftJoin(students, eq(parcelRequests.studentId, students.id))
        .where(eq(parcelRequests.status, 'pending'))
        .orderBy(parcelRequests.createdAt);
    }

    const searchTerm = `%${query.trim()}%`;

    return await db
      .select({
        id: parcelRequests.id,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        collectionType: parcelRequests.collectionType,
        expectedDate: parcelRequests.expectedDate,
        studentName: students.fullName,
      })
      .from(parcelRequests)
      .leftJoin(students, eq(parcelRequests.studentId, students.id))
      .where(
        and(
          eq(parcelRequests.status, 'pending'),
          or(
            ilike(parcelRequests.platform, searchTerm),
            ilike(parcelRequests.orderLast4, searchTerm),
            ilike(students.fullName, searchTerm)
          )
        )
      )
      .orderBy(parcelRequests.createdAt);
  }

  async getReadyForPickupSummary(limit: number) {
    return await db
      .select({
        id: parcelRequests.id,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        studentName: students.fullName,
      })
      .from(parcelRequests)
      .leftJoin(students, eq(parcelRequests.studentId, students.id))
      .where(eq(parcelRequests.status, 'ready_for_pickup'))
      .orderBy(desc(parcelRequests.createdAt))
      .limit(limit);
  }

  async getOverdueSummary(limit: number) {
    return await db
      .select({
        id: parcelRequests.id,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        studentName: students.fullName,
      })
      .from(parcelRequests)
      .leftJoin(students, eq(parcelRequests.studentId, students.id))
      .where(eq(parcelRequests.status, 'overdue'))
      .orderBy(desc(parcelRequests.createdAt))
      .limit(limit);
  }
}
