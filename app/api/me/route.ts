import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function GET() {
  console.log('API ME ROUTE EXECUTING');
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;

    if (!token) {
      return NextResponse.json({ address: null }, { status: 200 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const address = payload.address as string;

    return NextResponse.json({ address: address || null });
  } catch {
    // Token invalid or expired — clear it
    const res = NextResponse.json({ address: null }, { status: 200 });
    res.cookies.delete('fragmentfi_session');
    return res;
  }
}
