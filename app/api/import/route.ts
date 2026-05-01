import { NextResponse } from 'next/server';
import { importService } from '@/services/import.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenant_id, source_type, raw_payload } = body;

    if (!tenant_id || !source_type || !raw_payload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await importService.processImport({
      tenant_id,
      source_type,
      raw_payload
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API Import] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
