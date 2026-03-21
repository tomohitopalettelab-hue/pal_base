import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionValue, MAIN_SESSION_COOKIE_NAME, isExpired } from '../../../../lib/auth-session';

export async function GET() {
  try {
    const store = await cookies();
    const value = store.get(MAIN_SESSION_COOKIE_NAME)?.value;
    const session = parseSessionValue(value);

    if (!session || session.role !== 'customer' || isExpired(session)) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      paletteId: session.customerId || '',
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
