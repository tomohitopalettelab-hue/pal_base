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

type BannerGenerateBody = {
  keyword: string;
  businessType?: string;
  tone?: string;
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

    const body = (await req.json()) as BannerGenerateBody;
    const keyword = String(body.keyword || '').trim();
    const businessType = String(body.businessType || '').trim();
    const tone = String(body.tone || 'casual').trim();

    if (!keyword) {
      return NextResponse.json({ success: false, error: 'キーワードを入力してください。' }, { status: 400 });
    }

    const systemPrompt = `あなたは店舗の販促バナーのコピーライターです。GBP（Googleビジネスプロフィール）投稿やLINEリッチメッセージに使うバナー画像のテキストを作成します。

ルール：
1. メインコピーは15文字以内で強い訴求力を持たせる
2. サブコピーは30文字以内で補足情報を入れる
3. CTAテキスト（ボタン文言）は8文字以内
4. 3パターン提案する
5. 日本語で回答する

以下のJSON形式で返してください（JSONのみ、説明不要）：
{
  "banners": [
    {
      "mainCopy": "メインコピー（15文字以内）",
      "subCopy": "サブコピー（30文字以内）",
      "ctaText": "CTA文言（8文字以内）",
      "colorSuggestion": "推奨配色テーマ（warm/cool/vivid/elegantのいずれか）"
    }
  ]
}`;

    const userPrompt = [
      `キーワード: ${keyword}`,
      businessType ? `業種: ${businessType}` : '',
      `トーン: ${tone}`,
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
            temperature: 0.8,
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

    const message = lastError instanceof Error ? lastError.message : 'AI生成に失敗しました。';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'エラーが発生しました。';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
