import { NextResponse } from 'next/server';
import { rpc } from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const FRAG_CONTRACT = process.env.NEXT_PUBLIC_FRAG_CONTRACT_ID || '';
const TREASURY_CONTRACT = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || '';
const YIELD_CONTRACT = process.env.NEXT_PUBLIC_YIELD_CONTRACT_ID || '';

export async function GET(req: Request) {
  try {
    const server = new rpc.Server(RPC_URL);
    
    // Get latest ledger to fetch recent events
    const latestLedgerResponse = await server.getLatestLedger();
    const startLedger = Math.max(1, latestLedgerResponse.sequence - 1000); // Last ~1000 ledgers

    const contracts = [FRAG_CONTRACT, TREASURY_CONTRACT, YIELD_CONTRACT].filter(c => c.length === 56);

    if (contracts.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const eventsResponse = await server.getEvents({
      startLedger,
      filters: [{
        type: 'contract',
        contractIds: contracts
      }],
      limit: 50
    });

    const parsedEvents = eventsResponse.events.map(ev => {
      let topicStr = '';
      try {
        topicStr = ev.topic.map(t => t.toXDR('base64')).join(', ');
      } catch {}

      return {
        id: ev.id,
        contractId: ev.contractId,
        ledger: ev.ledger,
        type: ev.type,
        topic: topicStr,
        // Usually value is parsed to native, but raw XDR is fine for basic streaming
        valueXdr: ev.value.toXDR('base64')
      };
    });

    return NextResponse.json({ events: parsedEvents });
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch on-chain events' }, { status: 500 });
  }
}
