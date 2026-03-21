import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId } from '../../_lib/pal-base-store';

export async function GET(req: Request) {
  try {
    const store = await cookies();
    const value = store.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'admin' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '管理者認証が必要です。' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paletteId = searchParams.get('paletteId') || '';
    if (!paletteId) return NextResponse.json({ success: false, error: 'paletteId が必要です。' }, { status: 400 });

    const settings = await getSettingsByPaletteId(paletteId);
    return NextResponse.json({
      success: true,
      settings: settings ? {
        gbpConnected: !!settings.gbpAccessToken,
        gbpLocationId: settings.gbpLocationId,
        lineConnected: !!settings.lineChannelAccessToken,
        lineRichMenuId: settings.lineDefaultRichMenuId,
      } : { gbpConnected: false, gbpLocationId: null, lineConnected: false, lineRichMenuId: null },
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '取得に失敗しました。' }, { status: 500 });
  }
}
