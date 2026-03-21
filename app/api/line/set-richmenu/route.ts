import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId, upsertSettings } from '../../_lib/pal-base-store';

type RichMenuAreaInput = {
  bounds: { x: number; y: number; width: number; height: number };
  action: { type: string; uri?: string; text?: string };
};

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

    if (!settings?.lineChannelAccessToken) {
      return NextResponse.json({ success: false, error: 'LINE連携が設定されていません。管理者にお問い合わせください。' }, { status: 400 });
    }

    const body = await req.json();
    const imageBase64 = String(body.imageBase64 || '');
    const areas: RichMenuAreaInput[] = body.areas || [];
    const menuName = String(body.menuName || 'Pal Base Rich Menu');
    const rows: number = body.rows || 2;

    if (!imageBase64) return NextResponse.json({ success: false, error: '画像データがありません。' }, { status: 400 });

    const token = settings.lineChannelAccessToken;
    const imageW = 2500;
    const imageH = rows === 1 ? 843 : 1686;

    // 1. リッチメニュー作成
    const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        size: { width: imageW, height: imageH },
        selected: true,
        name: menuName,
        chatBarText: 'メニュー',
        areas: areas.length > 0 ? areas : [{ bounds: { x: 0, y: 0, width: imageW, height: imageH }, action: { type: 'message', text: 'メニュー' } }],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err?.message || `リッチメニュー作成に失敗 (${createRes.status})`);
    }

    const { richMenuId } = await createRes.json();

    // 2. 画像アップロード
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      // クリーンアップ: 作成したリッチメニューを削除
      await fetch(`https://api.line.me/v2/bot/richmenu/${richMenuId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      throw new Error(`画像アップロードに失敗 (${uploadRes.status})`);
    }

    // 3. デフォルトリッチメニューに設定
    const setDefaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!setDefaultRes.ok) {
      throw new Error(`デフォルト設定に失敗 (${setDefaultRes.status})`);
    }

    // 4. 古いリッチメニューを削除
    const oldMenuId = settings.lineDefaultRichMenuId;
    if (oldMenuId && oldMenuId !== richMenuId) {
      await fetch(`https://api.line.me/v2/bot/richmenu/${oldMenuId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }

    // 5. 新しいIDを保存
    await upsertSettings(paletteId, { lineDefaultRichMenuId: richMenuId });

    return NextResponse.json({ success: true, richMenuId, message: 'LINEリッチメニューを設定しました！' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'エラーが発生しました。' }, { status: 500 });
  }
}
