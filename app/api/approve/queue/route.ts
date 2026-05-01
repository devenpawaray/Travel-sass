import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get('tenant_id');

    if (!tenant_id) {
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('approvals')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('status', 'pending');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Approvals Queue] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
