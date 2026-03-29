import { NextRequest, NextResponse } from 'next/server';
import { hasPalOptService } from '../_lib/pal-base-accounts';

export async function GET(request: NextRequest) {
  try {
    const paletteId = String(request.nextUrl.searchParams.get('paletteId') || '').trim();
    if (!paletteId) {
      return NextResponse.json(
        { success: false, error: 'paletteId は必須です' },
        { status: 400 },
      );
    }

    const hasPalOpt = await hasPalOptService(paletteId);
    return NextResponse.json({ success: true, hasPalOpt });
  } catch (error) {
    console.error('[check-pal-opt] error:', error);
    return NextResponse.json(
      { success: false, error: 'pal_opt サービス確認中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
