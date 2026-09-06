import { NextRequest, NextResponse } from 'next/server';
import { EscalationService } from '@/lib/services/EscalationService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const escalationService = new EscalationService();
    const summary = await escalationService.runEscalationSweep();
    
    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (error) {
    console.error('Escalation sweep failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
