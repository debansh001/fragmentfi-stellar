import { NextResponse } from 'next/server';
import { Keypair } from 'stellar-sdk';
import { SignJWT } from 'jose';
import prisma from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function POST(req: Request) {
  try {
    const { address, message, signature } = await req.json();

    if (!address || !message || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature using Stellar SDK
    const keypair = Keypair.fromPublicKey(address);
    const signatureBuffer = Buffer.from(signature, 'base64');
    
    // Some freighter versions just sign the raw message, others hash it.
    // Assuming raw message signature verification:
    const isValid = keypair.verify(Buffer.from(message), signatureBuffer);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Upsert user into database
    let user = await prisma.user.findUnique({
      where: { wallet_address: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet_address: address,
        },
      });
      
      // Also create empty portfolio
      await prisma.portfolio.create({
        data: {
          user_id: user.id,
          frag_balance: 0,
          usd_value: 0
        }
      });
    }

    // Create session token (JWT)
    const token = await new SignJWT({ id: user.id, address: user.wallet_address })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('fragmentfi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
