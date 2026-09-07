import { sql, eq, and, isNull, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels, parcelRequests } from '@/lib/db/schema';

export class AnalyticsRepository {
  /**
   * 1. Count of parcels where arrivedAt falls in the current calendar month
   * vs the previous calendar month (for period-over-period delta).
   */
  async getParcelsThisMonth(): Promise<{ current: number; previous: number }> {
    const [result] = await db
      .select({
        current: sql<number>`count(*) filter (where ${parcels.arrivedAt} >= date_trunc('month', now()) and ${parcels.arrivedAt} < date_trunc('month', now()) + interval '1 month')`,
        previous: sql<number>`count(*) filter (where ${parcels.arrivedAt} >= date_trunc('month', now() - interval '1 month') and ${parcels.arrivedAt} < date_trunc('month', now()))`,
      })
      .from(parcels);

    return {
      current: Number(result?.current || 0),
      previous: Number(result?.previous || 0),
    };
  }

  /**
   * 2. Average days between arrivedAt and collectedAt (only for parcels where collectedAt is not null),
   * for parcels collected this month vs last month.
   */
  async getAvgDwellTime(): Promise<{ current: number; previous: number }> {
    const [result] = await db
      .select({
        current: sql<number>`avg(extract(epoch from (${parcels.collectedAt} - ${parcels.arrivedAt})) / 86400.0) filter (where ${parcels.collectedAt} is not null and ${parcels.collectedAt} >= date_trunc('month', now()) and ${parcels.collectedAt} < date_trunc('month', now()) + interval '1 month')`,
        previous: sql<number>`avg(extract(epoch from (${parcels.collectedAt} - ${parcels.arrivedAt})) / 86400.0) filter (where ${parcels.collectedAt} is not null and ${parcels.collectedAt} >= date_trunc('month', now() - interval '1 month') and ${parcels.collectedAt} < date_trunc('month', now()))`,
      })
      .from(parcels);

    const current = result?.current !== null && result?.current !== undefined
      ? Number(Number(result.current).toFixed(1))
      : 0;

    const previous = result?.previous !== null && result?.previous !== undefined
      ? Number(Number(result.previous).toFixed(1))
      : 0;

    return {
      current,
      previous,
    };
  }

  /**
   * 3. Percentage (0-100) of currently active parcels (collectedAt IS NULL) whose linked
   * parcel_requests.status is 'overdue', vs total active parcels.
   *
   * Note on `previous`: Overdue rate is a live point-in-time status of currently active,
   * uncollected inventory. Calculating a historical point-in-time active overdue rate
   * for the previous month is not possible without an immutable daily snapshot table,
   * so we return only `current` rather than fabricating a misleading historical value.
   */
  async getOverdueRate(): Promise<{ current: number }> {
    const [result] = await db
      .select({
        totalActive: sql<number>`count(*) filter (where ${parcels.collectedAt} is null)`,
        overdueActive: sql<number>`count(*) filter (where ${parcels.collectedAt} is null and ${parcelRequests.status} = 'overdue')`,
      })
      .from(parcels)
      .leftJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id));

    const total = Number(result?.totalActive || 0);
    const overdue = Number(result?.overdueActive || 0);
    const current = total > 0 ? Number(((overdue / total) * 100).toFixed(1)) : 0;

    return { current };
  }

  /**
   * 4. The platform with the most orders this month (join parcels to parcelRequests,
   * group by platform, order by count desc, limit 1).
   */
  async getPeakPlatform(): Promise<{ platform: string; count: number }> {
    const [result] = await db
      .select({
        platform: parcelRequests.platform,
        count: sql<number>`count(*)`,
      })
      .from(parcels)
      .innerJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id))
      .where(
        and(
          sql`${parcels.arrivedAt} >= date_trunc('month', now())`,
          sql`${parcels.arrivedAt} < date_trunc('month', now()) + interval '1 month'`
        )
      )
      .groupBy(parcelRequests.platform)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    return {
      platform: result?.platform || 'N/A',
      count: Number(result?.count || 0),
    };
  }

  /**
   * 5. Count of parcels where isUnregistered = true (all-time active, i.e. collectedAt IS NULL).
   */
  async getUnregisteredCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(parcels)
      .where(
        and(
          eq(parcels.isUnregistered, true),
          isNull(parcels.collectedAt)
        )
      );

    return Number(result?.count || 0);
  }

  /**
   * 6. Count of parcels arrived per day for the last N days, for the bar chart.
   * Grouped by date, ordered chronologically, with zero-count days filled in.
   */
  async getDailyVolume(days: number = 14): Promise<Array<{ date: string; count: number }>> {
    const rows = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${parcels.arrivedAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(parcels)
      .where(
        sql`${parcels.arrivedAt} >= date_trunc('day', now()) - (${days - 1} || ' days')::interval`
      )
      .groupBy(sql`date_trunc('day', ${parcels.arrivedAt})`)
      .orderBy(sql`date_trunc('day', ${parcels.arrivedAt})`);

    const dateMap = new Map<string, number>();
    for (const r of rows) {
      if (r.date) {
        dateMap.set(r.date, Number(r.count || 0));
      }
    }

    const result: Array<{ date: string; count: number }> = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0,
      });
    }

    return result;
  }
}
