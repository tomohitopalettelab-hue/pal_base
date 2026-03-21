import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId, upsertSettings } from '../../_lib/pal-base-store';

export async function POST(req: Request) {
  try {
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '認証が必要です。' }, { status: 401 });
    }
    const paletteId = session.customerId || '';
    const settings = await getSettingsByPaletteId(paletteId);

    if (!settings?.gbpAccessToken || !settings?.gbpLocationId) {
      return NextResponse.json({ success: false, error: 'GBP連携が設定されていません。管理者にお問い合わせください。' }, { status: 400 });
    }

    const body = await req.json();
    const profileText = String(body.profileText || '').trim();
    if (!profileText) return NextResponse.json({ success: false, error: 'プロフィール文が空です。' }, { status: 400 });

    // トークンリフレッシュ試行
    let accessToken = settings.gbpAccessToken;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (settings.gbpRefreshToken && clientId && clientSecret) {
      try {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'refresh_token', client_id: clientId, client_secret: clientSecret, refresh_token: settings.gbpRefreshToken }).toString(),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
          accessToken = refreshData.access_token;
          await upsertSettings(paletteId, { gbpAccessToken: accessToken });
        }
      } catch { /* use existing token */ }
    }

    // GBP プロフィール更新
    const locationId = settings.gbpLocationId;
    const updateRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?updateMask=profile`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { description: profileText } }),
      }
    );

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `GBP更新に失敗しました (${updateRes.status})`);
    }

    return NextResponse.json({ success: true, message: 'GBPプロフィールを更新しました。' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'エラーが発生しました。' }, { status: 500 });
  }
}
