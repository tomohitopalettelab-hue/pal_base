import { NextRequest, NextResponse } from 'next/server';
import { findPalBaseAccountByPaletteId } from '../_lib/pal-base-accounts';

export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get('cid');
  if (!cid) return NextResponse.json({ error: 'cid is required' }, { status: 400 });

  try {
    const account = await findPalBaseAccountByPaletteId(cid);

    if (!account) {
      return NextResponse.json({
        service: 'pal_base',
        serviceName: 'Pal Base',
        paletteId: cid,
        kpi: { status: '未契約' },
        health: 'red' as const,
        lastActivity: null,
      });
    }

    const planTier = account.isStandard ? 'Standard' : 'Lite';

    return NextResponse.json({
      service: 'pal_base',
      serviceName: 'Pal Base',
      paletteId: cid,
      kpi: {
        planTier,
        status: account.status || 'active',
        couponGenerated: '-',
        bannerCreated: '-',
        richMenuCreated: '-',
        gbpProfileGenerated: '-',
      },
      health: 'green' as const,
      lastActivity: null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
