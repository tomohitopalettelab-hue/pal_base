import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getPresetByType, getSeasonKey } from '../../_lib/business-presets';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  const code = Number((error as Record<string, unknown>)?.status || (error as Record<string, unknown>)?.code || 0);
  if (code === 429 || code === 500 || code === 503 || code === 504) return true;
  const message = String((error as Record<string, unknown>)?.message || '').toLowerCase();
  return message.includes('rate limit') || message.includes('overloaded') || message.includes('timeout') || message.includes('unavailable');
};

type CouponGenerateBody = {
  businessType: string;
  businessName?: string;
  campaignGoal?: string;
  targetAudience?: string;
  freeText?: string;
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

    const body = (await req.json()) as CouponGenerateBody;
    const businessType = String(body.businessType || '').trim();
    const businessName = String(body.businessName || '').trim();
    const campaignGoal = String(body.campaignGoal || '').trim();
    const targetAudience = String(body.targetAudience || '').trim();
    const freeText = String(body.freeText || '').trim();

    if (!businessType) {
      return NextResponse.json({ success: false, error: '業種を選択してください。' }, { status: 400 });
    }

    const preset = getPresetByType(businessType);
    const seasonKey = getSeasonKey();
    const seasonTip = preset?.seasonalTips?.[seasonKey] || '';

    const systemPrompt = `あなたは地域密着型の店舗集客の専門家です。心理学に基づいた「今すぐ行きたい！」と思わせるクーポン・キャンペーンを提案します。

以下のルールに従ってください：
1. 「クーポンあります」のような平凡なコピーは絶対にNG
2. 限定性、損失回避、社会的証明、返報性などの心理トリガーを必ず1つ以上使う
3. LINEの通知が来た瞬間に「指が動く」ようなキャッチコピーにする
4. 利用条件は店舗が実行しやすいシンプルなものにする
5. 日本語で回答する

${preset ? `業種特性:\n効果的なフック: ${preset.hooks.join('、')}\n避けるべきパターン: ${preset.avoidPatterns.join('、')}` : ''}
${seasonTip ? `今の季節のアドバイス: ${seasonTip}` : ''}

以下のJSON形式で3パターン返してください（JSONのみ、説明不要）：
{
  "coupons": [
    {
      "hookTitle": "LINEで通知が来た瞬間に目を引くキャッチコピー（30文字以内）",
      "description": "クーポンの詳しい内容説明（100文字以内）",
      "conditions": "利用条件（簡潔に）",
      "validityPeriod": "推奨有効期間",
      "psychologyNote": "このアプローチが効く心理学的根拠（50文字以内）"
    }
  ]
}`;

    const userPrompt = [
      businessName ? `店舗名: ${businessName}` : '',
      preset ? `業種: ${preset.label}` : `業種: ${businessType}`,
      campaignGoal ? `目的: ${campaignGoal}` : '',
      targetAudience ? `ターゲット: ${targetAudience}` : '',
      freeText ? `追加情報: ${freeText}` : '',
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
            maxOutputTokens: 2000,
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
