import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AnalyticsRepository } from '@/lib/repositories/AnalyticsRepository';
import { DetailCard } from '@/components/DetailCard';
import { ParcelVolumeChart } from './components/ParcelVolumeChart';
import { AdminKpiCards } from './components/AdminKpiCards';
import { Inbox } from 'lucide-react';

export default async function AdminOverviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    redirect('/login');
  }

  const analyticsRepo = new AnalyticsRepository();

  const [
    parcelsThisMonth,
    avgDwellTime,
    overdueRate,
    peakPlatform,
    unregisteredCount,
    dailyVolume,
  ] = await Promise.all([
    analyticsRepo.getParcelsThisMonth(),
    analyticsRepo.getAvgDwellTime(),
    analyticsRepo.getOverdueRate(),
    analyticsRepo.getPeakPlatform(),
    analyticsRepo.getUnregisteredCount(),
    analyticsRepo.getDailyVolume(14),
  ]);

  // Format delta for Parcels This Month
  const parcelsDeltaVal = parcelsThisMonth.current - parcelsThisMonth.previous;
  let parcelsDeltaStr = `${parcelsDeltaVal === 0 ? '' : parcelsDeltaVal > 0 ? '+' : ''}${parcelsDeltaVal} vs last month`;
  if (parcelsThisMonth.previous > 0) {
    const pct = Math.round((parcelsDeltaVal / parcelsThisMonth.previous) * 100);
    parcelsDeltaStr = `${pct > 0 ? '+' : ''}${pct}% vs last month`;
  }

  // Format delta for Avg Dwell Time
  const dwellDeltaVal = (avgDwellTime.current - avgDwellTime.previous).toFixed(1);
  const dwellDeltaStr =
    Number(dwellDeltaVal) === 0 && avgDwellTime.previous === 0
      ? 'No previous data'
      : `${Number(dwellDeltaVal) > 0 ? '+' : ''}${dwellDeltaVal} days vs last month`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard Overview</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Volume, efficiency, and overdue metrics for Gate No. 2.
        </p>
      </div>

      <AdminKpiCards
        parcelsThisMonth={{
          current: parcelsThisMonth.current,
          deltaStr: parcelsDeltaStr,
        }}
        avgDwellTime={{
          current: avgDwellTime.current,
          deltaStr: dwellDeltaStr,
        }}
        overdueRate={{
          current: overdueRate.current,
        }}
        peakPlatform={{
          platform: peakPlatform.platform,
          count: peakPlatform.count,
        }}
      />

      <ParcelVolumeChart data={dailyVolume} />

      <DetailCard className="flex items-center space-x-3 bg-[#FFF5F0]/50 border-[#FCDDC9]">
        <div className="p-2.5 rounded-full bg-[#FFE4D6] text-[#E4572E]">
          <Inbox className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-[#1a1a1a] leading-tight">
            Unregistered Parcels
          </h2>
          <p className="text-[12px] font-medium text-[#6B6B6B] mt-0.5">
            <strong className="text-[#1a1a1a]">{unregisteredCount} active parcels</strong> arrived without prior student registration.
          </p>
        </div>
      </DetailCard>
    </div>
  );
}
