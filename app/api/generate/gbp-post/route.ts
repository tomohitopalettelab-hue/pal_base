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

type GbpPostBody = {
  postType: string;
  businessName: string;
  businessType: string;
  topic?: string;
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

    const body = (await req.json()) as GbpPostBody;
    const postType = String(body.postType || '').trim();
    const businessName = String(body.businessName || '').trim();
    const businessType = String(body.businessType || '').trim();
    const topic = String(body.topic || '').trim();

    if (!postType || !businessName) {
      return NextResponse.json({ success: false, error: '投稿タイプと店舗名は必須です。' }, { status: 400 });
    }

    const systemPrompt = `あなたはGoogleビジネスプロフィール（GBP）の投稿コンテンツ作成の専門家です。
MEO（マップエンジン最適化）に効果的な投稿文を生成します。

ルール：
1. 投稿タイプに合った内容を生成
2. 検索に引っかかりやすいキーワードを自然に含める
3. 写真と組み合わせたときに効果的な文章構成
4. 行動を促すCTA（来店誘導）を含める
5. 日本語で回答する

以下のJSON形式で返してください（JSONのみ、説明不要）：
{
  "post": {
    "title": "投稿タイトル",
    "body": "投稿本文（300文字以内）",
    "cta": "行動喚起テキスト",
    "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"],
    "photoTip": "この投稿に合う写真の撮り方"
  }
}`;

    const userPrompt = [
      `投稿タイプ: ${postType}`,
      `店舗名: ${businessName}`,
      `業種: ${businessType}`,
      topic ? `トピック: ${topic}` : '',
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
            maxOutputTokens: 1500,
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
