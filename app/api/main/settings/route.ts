import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId } from '../../_lib/pal-base-store';

export async function GET() {
  try {
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ gbpConnected: false, lineConnected: false });
    }

    const paletteId = session.customerId || '';
    const settings = await getSettingsByPaletteId(paletteId);

    // Fetch industry from pal_db
    let industry = '';
    try {
      const baseUrl = process.env.PAL_DB_BASE_URL || 'https://pal-db.onrender.com';
      const accRes = await fetch(`${baseUrl}/api/accounts`, { next: { revalidate: 300 } });
      if (accRes.ok) {
        const accData = await accRes.json();
        const acc = (accData.accounts || []).find((a: { paletteId: string }) => a.paletteId === paletteId);
        industry = acc?.industry || '';
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      lineConnected: !!settings?.lineChannelAccessToken,
      qrCodes: settings?.qrCodes || [],
      industry,
    });
  } catch {
    return NextResponse.json({ lineConnected: false, qrCodes: [], industry: '' });
  }
}
