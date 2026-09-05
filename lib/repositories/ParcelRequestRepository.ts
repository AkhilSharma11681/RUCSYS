import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcelRequests } from '@/lib/db/schema';

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
}
