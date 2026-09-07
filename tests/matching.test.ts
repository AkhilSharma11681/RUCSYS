import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface Candidate {
  requestId: string;
  studentName: string;
  platform: string;
  orderLast4: string;
  expectedDate: string;
}

function resolveMatches(candidates: Candidate[]): {
  matches: Candidate[];
  isAmbiguous: boolean;
  bestMatch: Candidate | null;
} {
  // Sort by expectedDate ascending
  const sorted = [...candidates].sort(
    (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  );

  return {
    matches: sorted,
    isAmbiguous: sorted.length > 1,
    bestMatch: sorted.length === 1 ? sorted[0] : null,
  };
}

describe('Matching Logic', () => {
  it('identifies exact single match as unambiguous best match', () => {
    const candidate: Candidate = {
      requestId: 'req-1',
      studentName: 'Aarav Sharma',
      platform: 'Amazon',
      orderLast4: '4589',
      expectedDate: '2026-09-07',
    };

    const result = resolveMatches([candidate]);
    assert.equal(result.isAmbiguous, false);
    assert.deepEqual(result.bestMatch, candidate);
    assert.equal(result.matches.length, 1);
  });

  it('marks multiple candidate matches as ambiguous and sorts by expectedDate ASC', () => {
    const candidate1: Candidate = {
      requestId: 'req-1',
      studentName: 'Aarav Sharma',
      platform: 'Amazon',
      orderLast4: '4589',
      expectedDate: '2026-09-09',
    };
    const candidate2: Candidate = {
      requestId: 'req-2',
      studentName: 'Aarav Sharma',
      platform: 'Amazon',
      orderLast4: '9812',
      expectedDate: '2026-09-07',
    };

    const result = resolveMatches([candidate1, candidate2]);
    assert.equal(result.isAmbiguous, true);
    assert.equal(result.bestMatch, null);
    assert.equal(result.matches.length, 2);
    // Earlier expected date should be first
    assert.equal(result.matches[0].requestId, 'req-2');
    assert.equal(result.matches[1].requestId, 'req-1');
  });

  it('returns empty results when no candidates exist', () => {
    const result = resolveMatches([]);
    assert.equal(result.isAmbiguous, false);
    assert.equal(result.bestMatch, null);
    assert.equal(result.matches.length, 0);
  });
});
