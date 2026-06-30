"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SupplyChartProps {
  currentSupply: number;
}

export default function SupplyChart({ currentSupply }: SupplyChartProps) {
  // Generate mock historical supply data simulating growth over time
  const data = useMemo(() => {
    const history = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    let baseSupply = currentSupply * 0.4; // Start at 40% of current
    const step = (currentSupply - baseSupply) / 5; // Over 6 months
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      history.push({
        month: months[d.getMonth()],
        supply: i === 0 ? currentSupply : Math.max(0, baseSupply + (Math.random() * step * 0.5)),
      });
      baseSupply += step;
    }
    
    return history;
  }, [currentSupply]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">FRAG Supply History</h3>
          <p className="text-sm text-muted-foreground">Total minted supply over the last 6 months</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Supply</p>
          <p className="text-xl font-bold text-primary">{currentSupply.toLocaleString()} FRAG</p>
        </div>
      </div>
      
      <div className="h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [value.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Supply']}
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="supply" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
