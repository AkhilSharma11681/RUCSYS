import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OtpService } from '@/lib/services/OtpService';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== 'guard' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const otpService = new OtpService();

  try {
    await otpService.generate(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes('Parcel not found')) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}
