import { NextResponse } from 'next/server';
import { ParcelRepository } from '@/lib/repositories/ParcelRepository';
import { CapacityConfigRepository } from '@/lib/repositories/CapacityConfigRepository';

export async function GET() {
  const parcelRepo = new ParcelRepository();
  const configRepo = new CapacityConfigRepository();
  const [currentPackages, config] = await Promise.all([
    parcelRepo.countActive(),
    configRepo.getConfig(),
  ]);
  return NextResponse.json({
    currentPackages,
    maxCapacity: config?.maxCapacity ?? 100,
  });
}