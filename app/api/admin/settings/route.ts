import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId, upsertSettings } from '../../_lib/pal-base-store';

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
        lineConnected: !!settings.lineChannelAccessToken,
        lineRichMenuId: settings.lineDefaultRichMenuId,
        qrCodes: settings.qrCodes || [],
      } : { lineConnected: false, lineRichMenuId: null, qrCodes: [] },
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '取得に失敗しました。' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const store = await cookies();
    const value = store.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'admin' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '管理者認証が必要です。' }, { status: 401 });
    }

    const body = await req.json();
    const paletteId = body.paletteId;
    if (!paletteId) return NextResponse.json({ success: false, error: 'paletteId が必要です。' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (body.gbpLocationId) updates.gbpLocationId = body.gbpLocationId;
    if (body.qrCodes !== undefined) updates.qrCodes = body.qrCodes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: '更新する項目がありません。' }, { status: 400 });
    }

    await upsertSettings(paletteId, updates as Record<string, string>);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '保存に失敗しました。' }, { status: 500 });
  }
}
