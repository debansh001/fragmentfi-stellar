"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeRange = '30d' | '90d' | 'all';

// Mock data generator for the chart since we don't have historical balance snapshots in DB yet
const generateData = (days: number) => {
  const data = [];
  let baseValue = 1000;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some random noise and general upward trend
    baseValue = baseValue + (Math.random() * 50 - 20) + 5;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(0, baseValue)
    });
  }
  return data;
};

const mockData = {
  '30d': generateData(30),
  '90d': generateData(90),
  'all': generateData(365),
};

export default function PortfolioChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  const data = useMemo(() => mockData[timeRange], [timeRange]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance</h3>
          <p className="text-sm text-muted-foreground">Your portfolio value over time</p>
        </div>
        
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1">
          {(['30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
