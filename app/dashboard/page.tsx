"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import PortfolioChart from '@/components/PortfolioChart';
import YieldCountdown from '@/components/YieldCountdown';
import WalkthroughTutorial from '@/components/WalkthroughTutorial';

interface DashboardData {
  portfolio: {
    frag_balance: number;
    usd_value: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount_usd: number;
    frag_delta: number;
    timestamp: string;
    txn_hash: string | null;
  }>;
  totalYield: number;
  currentApy: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  // Calculate estimated next yield based on current balance and APY
  const dailyYieldRate = (data.currentApy / 100) / 365;
  const estimatedNextAmount = data.portfolio.frag_balance * dailyYieldRate;

  return (
    <>
      <WalkthroughTutorial />
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your FragmentFi portfolio.</p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Portfolio Value" 
          value={data.portfolio.usd_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
          prefix="$"
          change={2.4} 
          changeLabel="from last month" 
        />
        <StatCard 
          label="FRAG Balance" 
          value={data.portfolio.frag_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        />
        <StatCard 
          label="Total Yield Earned" 
          value={data.totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} 
          suffix=" FRAG"
        />
        <StatCard 
          label="Current APY" 
          value={data.currentApy} 
          suffix="%"
          change={0.5}
          changeLabel="vs last epoch"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        <div className="flex flex-col gap-6">
          <YieldCountdown estimatedAmount={estimatedNextAmount} />
          
          {/* Recent Transactions */}
          <div className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
              <Link href="/history" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            
            {data.recentTransactions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize text-foreground">{tx.type.toLowerCase()}</span>
                        {tx.txn_hash && (
                          <a 
                            href={`https://stellar.expert/explorer/testnet/tx/${tx.txn_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] px-1.5 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary rounded font-bold transition-colors"
                          >
                            Verify 🔍
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}${tx.amount_usd.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tx.frag_delta > 0 ? '+' : ''}{tx.frag_delta.toFixed(2)} FRAG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No recent transactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
