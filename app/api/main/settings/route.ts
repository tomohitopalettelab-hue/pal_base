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

    return NextResponse.json({
      gbpConnected: !!settings?.gbpAccessToken && !!settings?.gbpLocationId,
      lineConnected: !!settings?.lineChannelAccessToken,
    });
  } catch {
    return NextResponse.json({ gbpConnected: false, lineConnected: false });
  }
}
