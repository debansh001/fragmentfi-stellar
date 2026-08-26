"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import WalletConnectModal, { WalletType } from '@/components/WalletConnectModal';

export default function LandingPage() {
  const { address, isConnecting, connect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAUM: 0,
    activeHolders: 0,
    currentApy: 12.5,
    reserveRatio: 100,
  });

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  const handleConnect = (wallet: WalletType) => {
    if (wallet) { connect(wallet); setIsModalOpen(false); }
  };

  const handleCTA = () => {
    if (address) { window.location.href = '/dashboard'; }
    else { setIsModalOpen(true); }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-32 sm:pt-36 sm:pb-44">
        {/* Gradient blobs */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#10b981] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        <div className="absolute right-0 top-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl"
          >
            {/* Pill badge */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-foreground ring-1 ring-border bg-background/60 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                FragmentFi is live on Stellar Testnet
                <Link href="/reserves" className="font-semibold text-primary hover:underline">
                  View Reserves →
                </Link>
              </div>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6 leading-tight">
              The simplest way to earn{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">
                {stats.currentApy}% APY*
              </span>{' '}
              on Stellar.
            </h1>

            <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
              Deposit XLM or USDC. Receive FRAG — a yield-bearing token backed 1:1 on-chain.
              Withdraw instantly, any time. No banks. No middlemen.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCTA}
                disabled={isConnecting}
                className="rounded-full bg-primary px-10 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                {isConnecting ? 'Checking...' : address ? 'Go to Dashboard →' : 'Start with $1'}
              </button>
              <Link
                href="/how-it-works"
                className="rounded-full px-8 py-4 text-base font-semibold text-foreground border border-border hover:bg-muted transition-all"
              >
                How it works ↓
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted-foreground opacity-60">
              * {stats.currentApy}% APY is simulated on Stellar Testnet for demonstration purposes only.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total AUM', value: `$${stats.totalAUM.toLocaleString()}` },
              { label: 'Active Holders', value: stats.activeHolders.toLocaleString() },
              { label: 'Current APY', value: `${stats.currentApy}%` },
              { label: 'Reserve Ratio', value: `${stats.reserveRatio.toFixed(1)}%` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── HOW IT WORKS PREVIEW ── */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-base font-semibold uppercase tracking-wide text-primary">DeFi made simple</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Three steps to yield
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No staking periods, no claiming rewards, no bridges. Just deposit and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                icon: '🔗',
                step: '01',
                title: 'Connect Wallet',
                desc: 'Link your Freighter wallet with a single signature. No passwords. No KYC.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: '💰',
                step: '02',
                title: 'Deposit & Receive FRAG',
                desc: 'Deposit any amount starting from $1. FRAG tokens are minted 1:1 by our Soroban smart contract.',
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                icon: '📈',
                step: '03',
                title: 'Earn & Withdraw',
                desc: 'Your FRAG balance grows automatically. Redeem to XLM or USDC any time, instantly.',
                color: 'from-purple-500 to-purple-600',
              },
            ].map((step) => (
              <div key={step.step} className="relative flex flex-col p-8 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-110 transition-transform text-2xl`}>
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{step.step}</span>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Read the full guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROOF OF RESERVES ── */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl ring-1 ring-border bg-background shadow-lg overflow-hidden lg:flex">
            <div className="p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Fully Backed. Transparently.</h3>
              <p className="mt-4 text-muted-foreground leading-7">
                Every FRAG token is backed 1:1 by on-chain reserves. Verified in real-time via Soroban smart contracts on Stellar.
              </p>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
                {['100% On-chain Verification', 'Real-time Soroban Audit', 'No Rehypothecation', 'Instant Proof of Reserves'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-muted/50 py-10 text-center ring-1 ring-inset ring-border lg:py-16 h-full flex flex-col items-center justify-center">
                <p className="text-base font-semibold text-muted-foreground">Current Reserve Ratio</p>
                <p className="mt-4 text-6xl font-bold tracking-tight text-foreground">
                  {stats.reserveRatio.toFixed(1)}%
                </p>
                <Link
                  href="/reserves"
                  className="mt-8 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors"
                >
                  View Live Audit Log
                </Link>
                <p className="mt-4 text-xs text-muted-foreground">Synced via Stellar Horizon API</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Trusted by early adopters</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { initials: 'AL', name: 'Alex L.', role: 'Testnet Alpha User', gradient: 'from-blue-400 to-emerald-400', quote: '"The easiest DeFi platform I\'ve ever used. Connected Freighter, deposited XLM, and instantly started seeing yield."' },
              { initials: 'SJ', name: 'Sarah J.', role: 'DeFi Analyst', gradient: 'from-purple-400 to-pink-400', quote: '"The transparency is what sold me. Seeing the reserve ratio >100% gives me total peace of mind."' },
              { initials: 'MK', name: 'Marcus K.', role: 'Stellar Developer', gradient: 'from-orange-400 to-red-400', quote: '"Soroban smart contracts are incredibly fast. The UI is gorgeous and the background token minting is seamless."' },
            ].map((t) => (
              <figure key={t.name} className="rounded-2xl bg-muted/50 p-8 border border-border">
                <blockquote className="text-foreground text-sm leading-7">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="py-24 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join the FragmentFi testnet today. Get free XLM from Stellar Friendbot and try it instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="rounded-full bg-primary px-10 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all"
            >
              {address ? 'Go to Dashboard →' : 'Launch App'}
            </button>
            <Link
              href="https://fragmentfi-docs.vercel.app" target="_blank" rel="noopener noreferrer"
              className="rounded-full px-8 py-4 text-base font-semibold text-foreground border border-border hover:bg-muted transition-all"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span>FragmentFi</span>
              <span className="text-xs font-normal text-muted-foreground">— DeFi on Stellar</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link href="https://fragmentfi-docs.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Docs</Link>
              <Link href="/reserves" className="hover:text-foreground transition-colors">Reserves</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <a href="https://github.com/debansh001/fragmentfi-stellar" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            </nav>
            <p className="text-xs text-muted-foreground">© 2026 FragmentFi. Testnet only.</p>
          </div>
        </div>
      </footer>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />
    </div>
  );
}
