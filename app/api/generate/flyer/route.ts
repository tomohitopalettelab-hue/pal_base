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

const TASTE_TONE_MAP: Record<string, string> = {
  pop: '元気で活気があり、ワクワクする雰囲気。セール感や勢いを出す。「！」を多用し、テンション高め。',
  simple: '洗練されてスマートな雰囲気。無駄を省いた簡潔で知的なトーン。落ち着いた表現を使う。',
  japanese: '格式があり丁寧な雰囲気。和の美意識を感じる言葉遣い。季節感や情緒を大切にする。',
  elegant: '高級感があり上品な雰囲気。洗練された言葉選びで特別感を演出。控えめながら品格のある表現。',
  casual: '親しみやすく日常的な雰囲気。友達に話しかけるようなフレンドリーなトーン。気軽さを出す。',
  natural: '自然で安心感のある雰囲気。オーガニックや素材の良さを感じさせる温かい言葉遣い。',
};

type FlyerGenerateBody = {
  keyword: string;
  businessType: string;
  purpose?: string;
  taste?: string;
  size?: string;
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

    const body = (await req.json()) as FlyerGenerateBody;
    const keyword = String(body.keyword || '').trim();
    const businessType = String(body.businessType || '').trim();
    const purpose = String(body.purpose || '').trim();
    const taste = String(body.taste || 'pop').trim();
    const size = String(body.size || 'a4').trim();

    if (!keyword) {
      return NextResponse.json({ success: false, error: 'キーワードを入力してください。' }, { status: 400 });
    }

    const tasteTone = TASTE_TONE_MAP[taste] || TASTE_TONE_MAP['pop'];

    const sizeLabel = size === 'a4' ? 'A4縦向き' : size === 'a5' ? 'A5縦向き' : size === 'b5' ? 'B5縦向き' : 'はがきサイズ';

    const systemPrompt = `あなたはプロフェッショナルなチラシデザインのコピーライター兼アートディレクターです。
視認性が高く、ターゲットの心を掴む${sizeLabel}のチラシに掲載するテキスト一式を生成してください。

## 基本コンセプト
- テイスト: ${tasteTone}
${businessType ? `- 業種: ${businessType}` : ''}
${purpose ? `- 目的: ${purpose}` : ''}
- キーワード/テーマ: ${keyword}

## デザイン構成の原則
- レイアウトはZの法則（左上→右上→左下→右下の視線誘導）を意識
- キャッチコピーは最上部・最大フォントで最初に目に入る位置
- メインビジュアル（ユーザーの写真）が活きるよう、テキストは簡潔に
- 特典・オファーは視覚的に目立つボックスやバッジとして配置を想定
- 下部に連絡先・誘導（住所/電話番号/QRコード用スペース）を想定

## コピーライティングの原則
1. キャッチコピー: 一瞬で心を掴む。具体的なベネフィットか感情に訴える表現（15〜20文字）
2. サブコピー: キャッチを補足し「なぜ今」「なぜここ」を伝える（30〜40文字）
3. 本文: 3つのポイントに絞り、箇条書き的に簡潔に。チラシは3秒で読めるのが理想
4. 特典: 具体的な数字（%OFF、円引き、無料）を必ず含める。緊急性・限定性を付与
5. CTA: 「今すぐ○○」「○○はこちら」など、次のアクションが明確な文言
6. 期間: 緊急性を感じる現実的な期間設定

## 雰囲気のキーワード
テイストに合った3つの雰囲気キーワードも生成してください。

以下のJSON形式のみで返してください（マークダウン記法不要）：
{
  "catchCopy": "メインキャッチコピー（15〜20文字）",
  "subCopy": "サブキャッチコピー（30〜40文字）",
  "bodyText": "本文テキスト（改行区切りで3行。各行は箇条書き的に簡潔に）",
  "couponText": "特典・オファーテキスト（具体的な数字を含む）",
  "cta": "行動を促すCTAテキスト",
  "period": "開催期間・有効期間",
  "moodKeywords": ["雰囲気キーワード1", "雰囲気キーワード2", "雰囲気キーワード3"]
}`;

    const purposeMap: Record<string, string> = { open: 'オープン告知', campaign: 'キャンペーン', seasonal: '季節イベント', new_menu: '新メニュー', recruit: '求人・採用', info: 'お知らせ' };
    const purposeLabel = purposeMap[purpose] || purpose;
    const userPrompt = `${sizeLabel}のチラシを作成してください。\n${businessType ? `業種「${businessType}」、` : ''}${purposeLabel ? `目的「${purposeLabel}」、` : ''}テーマ「${keyword}」、テイスト「${taste}」で、プロフェッショナルなクオリティのコピーを生成してください。`;

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
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        });

        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);
        return NextResponse.json({ success: true, flyer: parsed });
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
