import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { ParcelRequestRepository } from '@/lib/repositories/ParcelRequestRepository';

export class ParcelRequestService {
  private capacityConfigRepo = new CapacityConfigRepository();
  private parcelRepo = new ParcelRepository();
  private parcelRequestRepo = new ParcelRequestRepository();

  async createRequest(data: {
    studentId: string;
    platform: string;
    orderLast4: string;
    expectedDate: string;
    collectionType: 'can_be_stored' | 'immediate';
  }): Promise<{ success: true; request: any } | { success: false; error: string }> {
    if (data.collectionType === 'can_be_stored') {
      const config = await this.capacityConfigRepo.getConfig();
      const activeCount = await this.parcelRepo.countActive();

      const usagePct = (activeCount / config.maxCapacity) * 100;
      if (usagePct >= config.pauseNewRequestsAtPct) {
        return {
          success: false,
          error:
            'Storage is nearly full — please select Immediate Collection or try again later.',
        };
      }
    }

    const created = await this.parcelRequestRepo.create(data);
    return { success: true, request: created };
  }

  async getRequestsByStudentId(studentId: string) {
    return await this.parcelRequestRepo.findByStudent(studentId);
  }

  async cancelRequest(id: string, studentId: string) {
    const cancelled = await this.parcelRequestRepo.cancel(id, studentId);
    if (!cancelled) {
      return { success: false, error: 'Request not found or cannot be cancelled' };
    }
    return { success: true, request: cancelled };
  }
}
