import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';
import { getPresetByType, getSeasonKey } from '../../_lib/business-presets';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  const status = (error as Record<string, unknown>)?.status as number | undefined;
  if (status === 429 || status === 500 || status === 503) return true;
  const message = String((error as Record<string, unknown>)?.message || '').toLowerCase();
  return message.includes('rate limit') || message.includes('overloaded') || message.includes('timeout');
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

    const apiKey = process.env.OPENAI_KEY_API || process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
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

以下のJSON形式で3パターン返してください：
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

    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 2000,
        });

        const raw = completion.choices?.[0]?.message?.content || '{}';
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
