"use client";

import React from 'react';

interface AuditLogEntry {
  id: string;
  type: string; // DEPOSIT (Mint), WITHDRAWAL (Burn), YIELD
  wallet_address: string;
  amount_usd: number;
  frag_delta: number;
  timestamp: string;
  txn_hash: string | null;
}

interface AuditLogProps {
  logs: AuditLogEntry[];
}

export default function AuditLog({ logs }: AuditLogProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'DEPOSIT':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'WITHDRAWAL':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'YIELD':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-foreground bg-muted border-border';
    }
  };

  const getEventName = (type: string) => {
    switch(type) {
      case 'DEPOSIT': return 'Mint';
      case 'WITHDRAWAL': return 'Burn';
      case 'YIELD': return 'Yield';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Audit Log</h3>
          <p className="text-sm text-muted-foreground">Recent on-chain Mint & Burn events</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Event</th>
              <th scope="col" className="px-6 py-4 font-medium">User</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Amount (FRAG)</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Value (USD)</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Time</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeStyle(log.type)}`}>
                    {getEventName(log.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-muted-foreground">
                  {formatAddress(log.wallet_address)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  <span className={log.frag_delta > 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}>
                    {log.frag_delta > 0 ? '+' : ''}{log.frag_delta.toFixed(4)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">
                  ${log.amount_usd.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {log.txn_hash && !log.txn_hash.startsWith('mock_') ? (
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${log.txn_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                    >
                      Stellar Expert ↗
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Mock Txn</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No recent events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
