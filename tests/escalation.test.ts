import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EscalationStage } from '../lib/types';

describe('Escalation Logic', () => {
  const config = {
    reminderAfterDays: 1,
    notifyAfterDays: 2,
    callAfterDays: 3,
    deadlineAfterDays: 5,
  };

  function evaluateEscalation(
    arrivedAtMs: number,
    nowMs: number,
    loggedStages: Set<EscalationStage>
  ): { stagesToTrigger: EscalationStage[]; shouldMarkOverdue: boolean } {
    const daysSinceArrival = Math.floor((nowMs - arrivedAtMs) / (1000 * 60 * 60 * 24));
    const stagesToTrigger: EscalationStage[] = [];
    let shouldMarkOverdue = false;

    const evaluateStage = (daysThreshold: number, stage: EscalationStage) => {
      if (daysSinceArrival >= daysThreshold && !loggedStages.has(stage)) {
        stagesToTrigger.push(stage);
        if (stage === EscalationStage.NOTIFICATION) {
          shouldMarkOverdue = true;
        }
      }
    };

    evaluateStage(config.reminderAfterDays, EscalationStage.REMINDER);
    evaluateStage(config.notifyAfterDays, EscalationStage.NOTIFICATION);
    evaluateStage(config.callAfterDays, EscalationStage.CALL);
    evaluateStage(config.deadlineAfterDays, EscalationStage.DEADLINE_PASSED);

    return { stagesToTrigger, shouldMarkOverdue };
  }

  it('triggers REMINDER stage after 1 day', () => {
    const now = Date.now();
    const arrivedAt = now - 1 * 24 * 60 * 60 * 1000 - 1000;
    const { stagesToTrigger, shouldMarkOverdue } = evaluateEscalation(arrivedAt, now, new Set());

    assert.deepEqual(stagesToTrigger, [EscalationStage.REMINDER]);
    assert.equal(shouldMarkOverdue, false);
  });

  it('triggers NOTIFICATION and marks overdue after 2 days', () => {
    const now = Date.now();
    const arrivedAt = now - 2 * 24 * 60 * 60 * 1000 - 1000;
    const { stagesToTrigger, shouldMarkOverdue } = evaluateEscalation(arrivedAt, now, new Set([EscalationStage.REMINDER]));

    assert.deepEqual(stagesToTrigger, [EscalationStage.NOTIFICATION]);
    assert.equal(shouldMarkOverdue, true);
  });

  it('does not re-trigger previously logged stages', () => {
    const now = Date.now();
    const arrivedAt = now - 4 * 24 * 60 * 60 * 1000;
    const alreadyLogged = new Set([
      EscalationStage.REMINDER,
      EscalationStage.NOTIFICATION,
      EscalationStage.CALL,
    ]);
    const { stagesToTrigger } = evaluateEscalation(arrivedAt, now, alreadyLogged);

    assert.deepEqual(stagesToTrigger, []);
  });

  it('triggers DEADLINE_PASSED stage after 5 days', () => {
    const now = Date.now();
    const arrivedAt = now - 5 * 24 * 60 * 60 * 1000 - 5000;
    const alreadyLogged = new Set([
      EscalationStage.REMINDER,
      EscalationStage.NOTIFICATION,
      EscalationStage.CALL,
    ]);
    const { stagesToTrigger } = evaluateEscalation(arrivedAt, now, alreadyLogged);

    assert.deepEqual(stagesToTrigger, [EscalationStage.DEADLINE_PASSED]);
  });
});
