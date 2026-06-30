"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface StatsBarProps {
  totalAum: number;
  activeHolders: number;
  reserveRatio: number;
}

export default function StatsBar({ totalAum, activeHolders, reserveRatio }: StatsBarProps) {
  const stats = [
    { label: 'Total Value Locked', value: `$${totalAum.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: 'Active Holders', value: activeHolders.toLocaleString() },
    { label: 'On-chain Reserve Ratio', value: `${reserveRatio.toFixed(1)}%` },
  ];

  return (
    <div className="relative -mt-12 z-10 mx-auto max-w-7xl px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto max-w-5xl rounded-2xl bg-background/80 backdrop-blur-md border border-border p-8 shadow-xl"
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-y-3 pt-6 sm:pt-0">
              <dt className="text-sm font-medium leading-6 text-muted-foreground uppercase tracking-wider">{stat.label}</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}
