import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { upsertSettings } from '../../_lib/pal-base-store';

export async function POST(req: Request) {
  try {
    const store = await cookies();
    const value = store.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'admin' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '管理者認証が必要です。' }, { status: 401 });
    }

    const body = await req.json();
    const paletteId = String(body.paletteId || '').trim();
    const lineChannelAccessToken = String(body.lineChannelAccessToken || '').trim();
    const lineChannelSecret = String(body.lineChannelSecret || '').trim();

    if (!paletteId) return NextResponse.json({ success: false, error: 'paletteId が必要です。' }, { status: 400 });
    if (!lineChannelAccessToken) return NextResponse.json({ success: false, error: 'Channel Access Token が必要です。' }, { status: 400 });

    // 接続テスト
    const testRes = await fetch('https://api.line.me/v2/bot/info', {
      headers: { Authorization: `Bearer ${lineChannelAccessToken}` },
    });

    if (!testRes.ok) {
      return NextResponse.json({ success: false, error: 'LINE APIへの接続に失敗しました。トークンを確認してください。' }, { status: 400 });
    }

    const botInfo = await testRes.json();

    await upsertSettings(paletteId, { lineChannelAccessToken, lineChannelSecret });
    return NextResponse.json({ success: true, botName: botInfo.displayName || 'LINE Bot', message: 'LINE連携を設定しました。' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '設定に失敗しました。' }, { status: 500 });
  }
}
