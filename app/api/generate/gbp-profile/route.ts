import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  const code = Number((error as Record<string, unknown>)?.status || (error as Record<string, unknown>)?.code || 0);
  if (code === 429 || code === 500 || code === 503 || code === 504) return true;
  const message = String((error as Record<string, unknown>)?.message || '').toLowerCase();
  return message.includes('rate limit') || message.includes('overloaded') || message.includes('timeout') || message.includes('unavailable');
};

type GbpProfileBody = {
  businessName: string;
  businessType: string;
  strength: string;
  targetCustomer: string;
  areaFeature: string;
  message: string;
};

export async function POST(req: Request) {
  try {
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);
    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ success: false, error: '認証が必要です。' }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini APIキーが設定されていません。' }, { status: 500 });
    }

    const body = (await req.json()) as GbpProfileBody;
    const businessName = String(body.businessName || '').trim();
    const businessType = String(body.businessType || '').trim();
    const strength = String(body.strength || '').trim();
    const targetCustomer = String(body.targetCustomer || '').trim();
    const areaFeature = String(body.areaFeature || '').trim();
    const freeMessage = String(body.message || '').trim();

    if (!businessName || !businessType) {
      return NextResponse.json({ success: false, error: '店舗名と業種は必須です。' }, { status: 400 });
    }

    const systemPrompt = `あなたはMEO（マップエンジン最適化）の専門家です。Googleビジネスプロフィール（GBP）のプロフィール文と投稿テンプレートを作成します。

ルール：
1. プロフィール文はSEOに強い（地域名+業種+強みのキーワードを自然に含む）
2. 読み手の心を掴む（機能説明ではなく、来店イメージが湧く文章）
3. 750文字以内
4. 投稿テンプレートは3種類（こだわり紹介/スタッフ紹介/お客様の声）
5. 各テンプレートは写真の撮り方アドバイス付き
6. 日本語で回答する

以下のJSON形式で返してください（JSONのみ、説明不要）：
{
  "profile": {
    "text": "GBPプロフィール文（750文字以内）",
    "keywords": ["SEOキーワード1", "SEOキーワード2"],
    "tips": "プロフィールをさらに良くするためのアドバイス"
  },
  "postTemplates": [
    {
      "type": "こだわり紹介",
      "title": "投稿タイトル例",
      "body": "投稿本文テンプレート（○○の部分を埋めてください形式）",
      "photoTip": "写真の撮り方アドバイス"
    },
    {
      "type": "スタッフ紹介",
      "title": "投稿タイトル例",
      "body": "投稿本文テンプレート",
      "photoTip": "写真の撮り方アドバイス"
    },
    {
      "type": "お客様の声",
      "title": "投稿タイトル例",
      "body": "投稿本文テンプレート",
      "photoTip": "写真の撮り方アドバイス"
    }
  ]
}`;

    const userPrompt = [
      `店舗名: ${businessName}`,
      `業種: ${businessType}`,
      strength ? `一番のこだわり: ${strength}` : '',
      targetCustomer ? `ターゲット客層: ${targetCustomer}` : '',
      areaFeature ? `地域の特徴: ${areaFeature}` : '',
      freeMessage ? `伝えたいメッセージ: ${freeMessage}` : '',
    ].filter(Boolean).join('\n');

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 3000,
            responseMimeType: 'application/json',
          },
        });

        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);
        return NextResponse.json({ success: true, ...parsed });
      } catch (err) {
        lastError = err;
        if (isRetryableError(err) && attempt < 2) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        break;
      }
    }

    const errMsg = lastError instanceof Error ? lastError.message : 'AI生成に失敗しました。';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'エラーが発生しました。';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
