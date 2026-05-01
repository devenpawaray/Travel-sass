import { NextResponse } from 'next/server';
import { killSwitchService } from '@/services/killSwitch.service';

export async function POST(req: Request) {
  try {
    const { tenant_id } = await req.json();

    if (!tenant_id) {
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    const result = await killSwitchService.activate(tenant_id);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
