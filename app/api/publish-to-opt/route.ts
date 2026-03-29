import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../lib/auth-session';
import { hasPalOptService } from '../_lib/pal-base-accounts';
import { buildPalDbUrl, palDbPost } from '../_lib/pal-db-client';

type PublishBody = {
  imageBase64: string;
  contentType: 'banner' | 'coupon' | 'flyer';
  copyText: string;
  mainCopy?: string;
  subCopy?: string;
  description?: string;
};

const VALID_CONTENT_TYPES = new Set(['banner', 'coupon', 'flyer']);

const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
};

const buildInstagramCaption = (copyText: string, contentType: string): string => {
  const tagMap: Record<string, string> = {
    banner: '#バナー #プロモーション #キャンペーン',
    coupon: '#クーポン #お得 #割引',
    flyer: '#チラシ #フライヤー #お知らせ',
  };
  const tags = tagMap[contentType] || '#お知らせ';
  return `${copyText}\n\n${tags}`;
};

const buildXText = (copyText: string, contentType: string): string => {
  const tagMap: Record<string, string> = {
    banner: ' #バナー #キャンペーン',
    coupon: ' #クーポン #お得',
    flyer: ' #チラシ #お知らせ',
  };
  const tags = tagMap[contentType] || '';
  const maxBody = 280 - tags.length;
  return truncate(copyText, maxBody) + tags;
};

const buildGbpSummary = (copyText: string): string => {
  return truncate(copyText, 1500);
};

export async function POST(request: NextRequest) {
  try {
    // 1. セッション検証
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);

    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ success: false, error: 'ログインが必要です' }, { status: 401 });
    }

    const paletteId = String(session.customerId || '').trim().toUpperCase();
    if (!paletteId) {
      return NextResponse.json({ success: false, error: 'セッション情報が不正です' }, { status: 401 });
    }

    // 2. pal_opt 契約確認
    const hasService = await hasPalOptService(paletteId);
    if (!hasService) {
      return NextResponse.json(
        { success: false, error: 'pal_opt サービスが契約されていません' },
        { status: 403 },
      );
    }

    // 3. リクエストボディ解析
    const body: PublishBody = await request.json();
    const { imageBase64, contentType, copyText, mainCopy, subCopy, description } = body;

    if (!imageBase64 || !contentType || !copyText) {
      return NextResponse.json(
        { success: false, error: '必須パラメータが不足しています (imageBase64, contentType, copyText)' },
        { status: 400 },
      );
    }

    if (!VALID_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json(
        { success: false, error: `無効なコンテンツタイプです: ${contentType}` },
        { status: 400 },
      );
    }

    // 4. Base64画像をバッファに変換してpal_dbメディアにアップロード
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const fileName = `pal-base-${contentType}-${Date.now()}.${ext}`;

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('file', blob, fileName);
    formData.append('paletteId', paletteId);

    const uploadUrl = buildPalDbUrl('/api/media/upload');
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: `画像アップロードに失敗しました: ${(uploadErr as { error?: string }).error || '不明なエラー'}` },
        { status: 500 },
      );
    }

    const uploadBody = await uploadRes.json();
    const imageUrl = uploadBody.asset?.url || '';

    // 5. SNSキャプション生成
    const instagramCaption = buildInstagramCaption(copyText, contentType);
    const gbpSummary = buildGbpSummary(copyText);
    const xText = buildXText(copyText, contentType);

    // 6. pal_opt_posts レコード作成
    const title = mainCopy || copyText.slice(0, 50);
    const topic = description || subCopy || `${contentType} from pal_base`;

    const postRes = await palDbPost('/api/pal-opt-posts', {
      paletteId,
      title,
      topic,
      keywords: [contentType, 'pal_base'],
      imageUrls: imageUrl ? [imageUrl] : [],
      status: 'draft',
      instagramCaption,
      instagramImageUrl: imageUrl,
      gbpSummary,
      gbpCallToAction: 'LEARN_MORE',
    });

    if (!postRes.ok) {
      const postErr = await postRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: `投稿作成に失敗しました: ${(postErr as { error?: string }).error || '不明なエラー'}` },
        { status: 500 },
      );
    }

    const postBody = await postRes.json();
    const postId = postBody.post?.id || '';

    // 7. 成功レスポンス
    return NextResponse.json({
      success: true,
      postId,
      imageUrl,
      xText,
      message: 'pal_opt に投稿が作成されました',
    });
  } catch (error) {
    console.error('[publish-to-opt] error:', error);
    return NextResponse.json(
      { success: false, error: '投稿の作成中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
