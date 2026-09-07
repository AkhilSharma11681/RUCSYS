import { db } from '@/lib/db';
import { parcelRequests, students } from '@/lib/db/schema';
import { eq, and, ilike, or, asc } from 'drizzle-orm';

export interface MatchCandidate {
  requestId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  platform: string;
  orderLast4: string;
  expectedDate: string;
  collectionType: 'can_be_stored' | 'immediate';
  status: string;
}

export interface MatchingResult {
  matches: MatchCandidate[];
  isAmbiguous: boolean;
  bestMatch: MatchCandidate | null;
}

export class MatchingService {
  /**
   * Searches pending parcel requests for a guard marking an arrival.
   * Matches against learner name, order last 4, or platform.
   * Results are sorted by expectedDate ascending so parcels expected today/soon surface first.
   */
  async findMatches(query: string): Promise<MatchingResult> {
    if (!query || query.trim().length === 0) {
      return { matches: [], isAmbiguous: false, bestMatch: null };
    }

    const searchTerm = `%${query.trim()}%`;

    const rawResults = await db
      .select({
        requestId: parcelRequests.id,
        studentId: students.id,
        studentName: students.fullName,
        studentEmail: students.email,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        expectedDate: parcelRequests.expectedDate,
        collectionType: parcelRequests.collectionType,
        status: parcelRequests.status,
      })
      .from(parcelRequests)
      .innerJoin(students, eq(parcelRequests.studentId, students.id))
      .where(
        and(
          eq(parcelRequests.status, 'pending'),
          or(
            ilike(students.fullName, searchTerm),
            ilike(students.email, searchTerm),
            ilike(parcelRequests.orderLast4, searchTerm),
            ilike(parcelRequests.platform, searchTerm)
          )
        )
      )
      .orderBy(asc(parcelRequests.expectedDate))
      .limit(10);

    const matches: MatchCandidate[] = rawResults.map((r) => ({
      requestId: r.requestId,
      studentId: r.studentId,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
      platform: r.platform,
      orderLast4: r.orderLast4,
      expectedDate: r.expectedDate,
      collectionType: r.collectionType,
      status: r.status,
    }));

    const isAmbiguous = matches.length > 1;
    const bestMatch = matches.length === 1 ? matches[0] : null;

    return {
      matches,
      isAmbiguous,
      bestMatch,
    };
  }

  /**
   * Matches specifically by platform AND order last 4.
   */
  async findExactMatch(platform: string, orderLast4: string): Promise<MatchingResult> {
    const rawResults = await db
      .select({
        requestId: parcelRequests.id,
        studentId: students.id,
        studentName: students.fullName,
        studentEmail: students.email,
        platform: parcelRequests.platform,
        orderLast4: parcelRequests.orderLast4,
        expectedDate: parcelRequests.expectedDate,
        collectionType: parcelRequests.collectionType,
        status: parcelRequests.status,
      })
      .from(parcelRequests)
      .innerJoin(students, eq(parcelRequests.studentId, students.id))
      .where(
        and(
          eq(parcelRequests.status, 'pending'),
          ilike(parcelRequests.platform, platform.trim()),
          eq(parcelRequests.orderLast4, orderLast4.trim())
        )
      )
      .orderBy(asc(parcelRequests.expectedDate));

    const matches: MatchCandidate[] = rawResults.map((r) => ({
      requestId: r.requestId,
      studentId: r.studentId,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
      platform: r.platform,
      orderLast4: r.orderLast4,
      expectedDate: r.expectedDate,
      collectionType: r.collectionType,
      status: r.status,
    }));

    return {
      matches,
      isAmbiguous: matches.length > 1,
      bestMatch: matches.length === 1 ? matches[0] : null,
    };
  }
}
