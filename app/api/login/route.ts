import { NextResponse } from 'next/server';
import { createSessionValue, SESSION_COOKIE_NAME, MAIN_SESSION_COOKIE_NAME, type SessionPayload } from '../../../lib/auth-session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id || '').trim();
    const password = String(body?.password || '');

    if (!id || !password) {
      return NextResponse.json({ success: false, error: 'IDとパスワードを入力してください。' }, { status: 400 });
    }

    const adminId = process.env.ADMIN_ID || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (id !== adminId || password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'ログイン情報が違います。' }, { status: 401 });
    }

    const session: SessionPayload = {
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 12,
    };

    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: createSessionValue(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    res.cookies.set({
      name: MAIN_SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'ログインに失敗しました。' }, { status: 500 });
  }
}
