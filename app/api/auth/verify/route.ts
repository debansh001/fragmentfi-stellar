import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { TransactionBuilder, Networks, Keypair, Transaction } from '@stellar/stellar-sdk';
import { createHash } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

function getServerKeypair() {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
  const seed = createHash('sha256').update(secret).digest();
  return Keypair.fromRawEd25519Seed(seed);
}

export async function POST(req: Request) {
  try {
    const { address, signedXdr } = await req.json();

    if (!address || !signedXdr) {
      return NextResponse.json({ error: 'Missing address or signature' }, { status: 400 });
    }

    const serverKeypair = getServerKeypair();
    const txInfo = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    
    // We expect a standard Transaction, not a FeeBumpTransaction for the challenge
    if (!('source' in txInfo)) {
        return NextResponse.json({ error: 'FeeBumpTransaction not supported for challenge' }, { status: 400 });
    }
    const tx = txInfo as Transaction;

    // Verify it's a valid challenge transaction (Source = Server)
    if (tx.source !== serverKeypair.publicKey()) {
      return NextResponse.json({ error: 'Invalid challenge source' }, { status: 400 });
    }

    // Verify server signed it
    const serverSignatureValid = tx.signatures.some(sig => {
      return serverKeypair.verify(tx.hash(), sig.signature());
    });

    if (!serverSignatureValid) {
      return NextResponse.json({ error: 'Missing server signature' }, { status: 400 });
    }

    // Verify user signed it
    const userKeypair = Keypair.fromPublicKey(address);
    const userSignatureValid = tx.signatures.some(sig => {
      return userKeypair.verify(tx.hash(), sig.signature());
    });

    if (!userSignatureValid) {
      return NextResponse.json({ error: 'Invalid or missing user signature' }, { status: 401 });
    }

    // Issue JWT
    const token = await new SignJWT({ address })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, address });
    response.cookies.set('fragmentfi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    // Sync user to Redis in background (non-blocking)
    syncUserToRedis(address).catch((e) =>
      console.warn('[verify] Redis user sync failed:', e?.message)
    );

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function syncUserToRedis(address: string) {
  const { default: redis, KEYS } = await import('@/lib/redis');
  const key = KEYS.user(address);
  const exists = await redis.exists(key);
  if (!exists) {
    await redis.set(key, JSON.stringify({
      wallet_address: address,
      created_at: new Date().toISOString(),
    }));
    await redis.incr(KEYS.statsHolders);
  }
}
