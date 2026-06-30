"use client";

import React from 'react';

interface Transaction {
  id: string;
  type: string;
  amount_usd: number;
  frag_delta: number;
  timestamp: string;
  txn_hash: string | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
}

export default function TransactionTable({ transactions, loading }: TransactionTableProps) {
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
      case 'DEPOSIT': return 'Deposit';
      case 'WITHDRAWAL': return 'Withdraw';
      case 'YIELD': return 'Yield';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Type</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Value (USD)</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">FRAG Delta</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Date & Time</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border relative">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeStyle(tx.type)}`}>
                      {getEventName(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-foreground">
                    ${tx.amount_usd.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <span className={tx.frag_delta > 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}>
                      {tx.frag_delta > 0 ? '+' : ''}{tx.frag_delta.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {tx.txn_hash ? (
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.txn_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                      >
                        Confirmed ↗
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No transactions found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
