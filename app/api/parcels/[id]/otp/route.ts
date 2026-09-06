import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels, parcelRequests } from '@/lib/db/schema';
import { auth } from '@/auth';
import { OtpService } from '@/lib/services/OtpService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== 'learner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID missing in session' }, { status: 403 });
  }

  // Verify ownership: parcel exists, is linked to a parcel_request, and belongs to session user
  const [record] = await db
    .select({
      parcelId: parcels.id,
      studentId: parcelRequests.studentId,
    })
    .from(parcels)
    .leftJoin(parcelRequests, eq(parcels.requestId, parcelRequests.id))
    .where(eq(parcels.id, id));

  if (!record) {
    return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
  }

  if (!record.studentId || record.studentId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const otpService = new OtpService();
  const code = await otpService.getPlaintextOtp(id);

  if (!code) {
    return NextResponse.json(
      { error: 'OTP not available or already collected' },
      { status: 404 }
    );
  }

  return NextResponse.json({ code });
}
