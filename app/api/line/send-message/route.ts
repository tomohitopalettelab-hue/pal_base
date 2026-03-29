import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getSettingsByPaletteId } from '../../_lib/pal-base-store';

// ── Types ────────────────────────────────────────────────────────────────────

type Taste = 'pop' | 'simple' | 'japanese' | 'elegant' | 'casual' | 'natural';

type CouponData = {
  hookTitle: string;
  description: string;
  conditions: string;
  validityPeriod: string;
};

type SendMessageBody = {
  mode: 'broadcast' | 'push';
  userIds?: string[];
  coupon: CouponData;
  taste: Taste;
  imageBase64?: string;
};

// ── Taste Color Map ──────────────────────────────────────────────────────────

const TASTE_COLORS: Record<Taste, { header: string; headerText: string; accent: string; bg: string }> = {
  pop:      { header: '#FF6B35', headerText: '#FFFFFF', accent: '#FF8C42', bg: '#FFF8F0' },
  simple:   { header: '#333333', headerText: '#FFFFFF', accent: '#666666', bg: '#F7F7F7' },
  japanese: { header: '#C41E3A', headerText: '#FFFFFF', accent: '#8B2500', bg: '#FDF5F0' },
  elegant:  { header: '#1B2A4A', headerText: '#D4AF37', accent: '#2C3E6B', bg: '#F5F5FA' },
  casual:   { header: '#8CC63F', headerText: '#FFFFFF', accent: '#6BA825', bg: '#F5FBF0' },
  natural:  { header: '#5D8C3E', headerText: '#FFFFFF', accent: '#4A7A2E', bg: '#F2F7EE' },
};

// ── Flex Message Builder ─────────────────────────────────────────────────────

function buildCouponFlexMessage(coupon: CouponData, taste: Taste) {
  const colors = TASTE_COLORS[taste] || TASTE_COLORS.simple;

  return {
    type: 'flex',
    altText: coupon.hookTitle,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: colors.header,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '\uD83C\uDF9F\uFE0F クーポン',
            color: colors.headerText,
            size: 'md',
            weight: 'bold',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: colors.bg,
        paddingAll: '20px',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: coupon.hookTitle,
            weight: 'bold',
            size: 'lg',
            wrap: true,
            color: '#111111',
          },
          {
            type: 'text',
            text: coupon.description,
            size: 'sm',
            wrap: true,
            color: '#555555',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#DDDDDD',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '\u2705',
                size: 'sm',
                flex: 0,
              },
              {
                type: 'text',
                text: coupon.conditions,
                size: 'sm',
                wrap: true,
                color: '#555555',
                flex: 5,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '\u23F0',
                size: 'sm',
                flex: 0,
              },
              {
                type: 'text',
                text: coupon.validityPeriod,
                size: 'sm',
                wrap: true,
                color: '#555555',
                flex: 5,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        backgroundColor: colors.bg,
        contents: [
          {
            type: 'text',
            text: 'このクーポンを提示してください',
            size: 'xs',
            color: colors.accent,
            align: 'center',
            weight: 'bold',
          },
        ],
      },
    },
  };
}

// ── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. セッション認証
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '認証が必要です。' }, { status: 401 });
    }

    // 2. paletteId取得
    const paletteId = session.customerId || '';

    // 3. LINE設定取得
    const settings = await getSettingsByPaletteId(paletteId);
    if (!settings?.lineChannelAccessToken) {
      return NextResponse.json(
        { success: false, error: 'LINE連携が設定されていません。管理者にお問い合わせください。' },
        { status: 400 },
      );
    }

    const token = settings.lineChannelAccessToken;
    const body: SendMessageBody = await req.json();
    const { mode, userIds, coupon, taste, imageBase64 } = body;

    // バリデーション
    if (!mode || !coupon || !taste) {
      return NextResponse.json({ success: false, error: 'mode, coupon, taste は必須です。' }, { status: 400 });
    }
    if (mode === 'push' && (!userIds || userIds.length === 0)) {
      return NextResponse.json({ success: false, error: 'push モードでは userIds が必要です。' }, { status: 400 });
    }

    // メッセージ配列を組み立て
    const messages: Record<string, unknown>[] = [];

    // 4. 画像がある場合はアップロードして画像メッセージを追加
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // LINE Content Upload API でアップロード
      const uploadRes = await fetch('https://api-data.line.me/v2/bot/message/content/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/png',
        },
        body: imageBuffer,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => null);
        if (uploadData?.contentUrl) {
          messages.push({
            type: 'image',
            originalContentUrl: uploadData.contentUrl,
            previewImageUrl: uploadData.contentUrl,
          });
        }
      }
      // 画像アップロードが失敗してもFlexメッセージは送信する
    }

    // 5. Flexメッセージを追加
    messages.push(buildCouponFlexMessage(coupon, taste));

    // 6. 送信
    let sentCount = 0;

    if (mode === 'broadcast') {
      const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `ブロードキャスト送信に失敗しました (${res.status})`);
      }
      sentCount = 1;
    } else {
      // push: ユーザーごとに送信
      for (const userId of userIds!) {
        const res = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: userId, messages }),
        });

        if (res.ok) {
          sentCount++;
        }
        // 個別送信の失敗は無視して次のユーザーに進む
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'エラーが発生しました。' },
      { status: 500 },
    );
  }
}
