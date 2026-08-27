import { NextResponse } from 'next/server';
import { Keypair, TransactionBuilder, Account, Networks, Operation } from '@stellar/stellar-sdk';
import { createHash } from 'crypto';

function getServerKeypair() {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
  const seed = createHash('sha256').update(secret).digest();
  return Keypair.fromRawEd25519Seed(seed);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || address.length !== 56) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const serverKeypair = getServerKeypair();
    
    // SEP-10 requires source account to be the server, with sequence 0
    const account = new Account(serverKeypair.publicKey(), "0");
    
    // Create random nonce
    const nonce = createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex').substring(0, 48);

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.manageData({
      name: "FragmentFi Auth",
      value: nonce,
      source: address // User is the source of the operation, so they must sign
    }))
    .setTimeout(300)
    .build();

    // Server signs the challenge
    tx.sign(serverKeypair);

    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (error: any) {
    console.error('Challenge error:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
