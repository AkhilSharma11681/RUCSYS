import { inArray, eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels, parcelRequests, escalationLog } from '@/lib/db/schema';
import { EscalationStage } from '@/lib/types';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';

export class EscalationService {
  private capacityConfigRepo = new CapacityConfigRepository();

  /**
   * Evaluates all uncollected, registered parcels against capacity config day-thresholds.
   * Logs new escalation stages and transitions parcel requests to 'overdue' when applicable.
   * 
   * Note: This service does NOT send actual emails or push notifications — that infrastructure
   * doesn't exist in this project yet. It only writes the escalation_log row and flips the status.
   */
  async runEscalationSweep() {
    const config = await this.capacityConfigRepo.getConfig();

    // 1. Fetch eligible parcels: stored (collected_at is null) and registered (is_unregistered is false)
    const eligibleParcels = await db
      .select({
        parcelId: parcels.id,
        arrivedAt: parcels.arrivedAt,
        requestId: parcels.requestId,
        requestStatus: parcelRequests.status,
      })
      .from(parcels)
      .innerJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id))
      .where(
        and(
          isNull(parcels.collectedAt),
          eq(parcels.isUnregistered, false)
        )
      );

    if (eligibleParcels.length === 0) {
      return { reminder: 0, notification: 0, call: 0, deadline_passed: 0 };
    }

    const parcelIds = eligibleParcels.map(p => p.parcelId);

    // 2. Fetch existing escalation logs to avoid duplicate logging
    const existingLogs = await db
      .select()
      .from(escalationLog)
      .where(inArray(escalationLog.parcelId, parcelIds));

    // Group existing logs by parcel ID
    const logsByParcelId = new Map<string, Set<EscalationStage>>();
    for (const log of existingLogs) {
      const stageSet = logsByParcelId.get(log.parcelId) || new Set<EscalationStage>();
      stageSet.add(log.stage as EscalationStage);
      logsByParcelId.set(log.parcelId, stageSet);
    }

    const nowMs = Date.now();
    
    const logsToInsert: { parcelId: string; stage: EscalationStage }[] = [];
    const requestsToMarkOverdue: string[] = [];

    const summary = {
      reminder: 0,
      notification: 0,
      call: 0,
      deadline_passed: 0,
    };

    // 3. Evaluate each parcel against thresholds
    for (const p of eligibleParcels) {
      if (!p.arrivedAt) continue;

      const arrivedAtMs = new Date(p.arrivedAt).getTime();
      const daysSinceArrival = Math.floor((nowMs - arrivedAtMs) / (1000 * 60 * 60 * 24));
      
      const loggedStages = logsByParcelId.get(p.parcelId) || new Set<EscalationStage>();

      const evaluateStage = (daysThreshold: number, stage: EscalationStage) => {
        if (daysSinceArrival >= daysThreshold && !loggedStages.has(stage)) {
          logsToInsert.push({ parcelId: p.parcelId, stage });
          summary[stage.toLowerCase() as keyof typeof summary]++;
          
          if (stage === EscalationStage.NOTIFICATION) {
            // Notification delivery is a separate, not-yet-built feature.
            if (p.requestId && p.requestStatus !== 'overdue') {
              requestsToMarkOverdue.push(p.requestId);
            }
          }
        }
      };

      evaluateStage(config.reminderAfterDays, EscalationStage.REMINDER);
      evaluateStage(config.notifyAfterDays, EscalationStage.NOTIFICATION);
      evaluateStage(config.callAfterDays, EscalationStage.CALL);
      evaluateStage(config.deadlineAfterDays, EscalationStage.DEADLINE_PASSED);
    }

    // 4. Batch database changes
    await db.transaction(async (tx) => {
      // Drizzle inserts can take an array, but we must ensure it's not empty
      if (logsToInsert.length > 0) {
        await tx.insert(escalationLog).values(logsToInsert);
      }

      if (requestsToMarkOverdue.length > 0) {
        await tx
          .update(parcelRequests)
          .set({ status: 'overdue' })
          .where(inArray(parcelRequests.id, requestsToMarkOverdue));
      }
    });

    return summary;
  }
}
