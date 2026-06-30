"use client";

import React, { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';
import HowItWorks from '@/components/HowItWorks';
import Link from 'next/link';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalAUM: 0,
    activeHolders: 0,
    currentApy: 12.5,
    reserveRatio: 100,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection apy={stats.currentApy} />
      <StatsBar 
        totalAum={stats.totalAUM} 
        activeHolders={stats.activeHolders} 
        reserveRatio={stats.reserveRatio} 
      />
      <HowItWorks />

      {/* Proof of Reserves Teaser */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-border sm:mt-10 lg:mx-0 lg:flex lg:max-w-none bg-background shadow-lg overflow-hidden">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Fully Backed. Transparently.</h3>
              <p className="mt-6 text-base leading-7 text-muted-foreground">
                Trust in DeFi is earned, not given. FragmentFi uses Soroban smart contracts on the Stellar network to ensure every FRAG minted is backed 1:1 by highly liquid, reserve assets.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-primary">What's inside the vault</h4>
                <div className="h-px flex-auto bg-border" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2 sm:gap-6"
              >
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  100% On-chain Verification
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Real-time Soroban Audit
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  No Rehypothecation
                </li>
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-muted/50 py-10 text-center ring-1 ring-inset ring-border lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-muted-foreground">Current Reserve Ratio</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-foreground">{stats.reserveRatio.toFixed(1)}%</span>
                  </p>
                  <Link
                    href="/reserves"
                    className="mt-10 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                  >
                    View Live Audit Log
                  </Link>
                  <p className="mt-6 text-xs leading-5 text-muted-foreground">
                    Data synced via Stellar Horizon API
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-primary">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by early adopters
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
              
              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-muted/50 p-8 text-sm leading-6 border border-border">
                  <blockquote className="text-foreground">
                    <p>“The easiest DeFi platform I've ever used. Connected Freighter, deposited XLM, and instantly started seeing yield. The instant withdrawals are a game changer.”</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold">AL</div>
                    <div>
                      <div className="font-semibold text-foreground">Alex L.</div>
                      <div className="text-muted-foreground">Testnet Alpha User</div>
                    </div>
                  </figcaption>
                </figure>
              </div>

              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-muted/50 p-8 text-sm leading-6 border border-border">
                  <blockquote className="text-foreground">
                    <p>“I love the transparency. Clicking straight from the dashboard to the Stellar Expert block explorer and seeing the reserve ratio >100% gives me total peace of mind.”</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">SJ</div>
                    <div>
                      <div className="font-semibold text-foreground">Sarah J.</div>
                      <div className="text-muted-foreground">DeFi Analyst</div>
                    </div>
                  </figcaption>
                </figure>
              </div>

              <div className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-muted/50 p-8 text-sm leading-6 border border-border">
                  <blockquote className="text-foreground">
                    <p>“Soroban smart contracts are incredibly fast. The UI is gorgeous, but the real star is how seamlessly it handles the complex bridging and token minting in the background.”</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">MK</div>
                    <div>
                      <div className="font-semibold text-foreground">Marcus K.</div>
                      <div className="text-muted-foreground">Stellar Developer</div>
                    </div>
                  </figcaption>
                </figure>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
