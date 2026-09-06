import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OtpService } from '@/lib/services/OtpService';

export async function POST(
  request: Request,
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

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code } = body || {};

  if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code.trim())) {
    return NextResponse.json(
      { error: 'Invalid code format. Must be a 4-digit numeric string.' },
      { status: 400 }
    );
  }

  const { id } = await params;
  const otpService = new OtpService();

  try {
    const result = await otpService.verify(id, code);

    if (result.status === 'success') {
      return NextResponse.json({ success: true });
    }

    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    if (result.status === 'already_collected') {
      return NextResponse.json({ success: false, reason: 'already_collected' });
    }

    if (result.status === 'locked') {
      return NextResponse.json({ success: false, reason: 'locked' });
    }

    // result.status === 'invalid'
    const attempts = result.attempts ?? 0;
    const attemptsRemaining = Math.max(0, 5 - attempts);

    return NextResponse.json({
      success: false,
      reason: 'invalid',
      attemptsRemaining,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
