"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';

interface HeroSectionProps {
  apy: number;
}

export default function HeroSection({ apy }: HeroSectionProps) {
  const { address, isConnecting, connect } = useWallet();

  const handleStart = () => {
    if (!address) {
      connect();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#10b981] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-foreground ring-1 ring-border hover:ring-foreground/20 bg-background/50 backdrop-blur-sm transition-all duration-300">
              FragmentFi is live on Stellar Testnet. <a href="/reserves" className="font-semibold text-primary"><span className="absolute inset-0" aria-hidden="true" />View Reserves <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6">
            The simplest way to earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">{apy}% APY</span> on Stellar.
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Convert your XLM or USDC into FRAG. Your funds are actively deployed in secure yield strategies and fully backed 1:1 on-chain. Withdraw instantly, any time.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleStart}
              disabled={isConnecting}
              className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : address ? 'Go to Dashboard' : 'Start with $1'}
            </button>
            <a href="#how-it-works" className="text-base font-semibold leading-6 text-foreground hover:text-primary transition-colors">
              How it works <span aria-hidden="true">↓</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
