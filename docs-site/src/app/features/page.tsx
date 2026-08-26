
export default function FeaturesPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Core Features</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">What FragmentFi Can Do</h1>
        <p className="text-muted-foreground">A breakdown of every major feature shipped in FragmentFi v1.0 on Stellar Testnet.</p>
      </div>

      <div className="space-y-8">
        {[
          { icon: "⚡", color: "bg-blue-500/10", title: "Fractional Treasury Pool", desc: "Deposit any amount of XLM or USDC (starting from $1) into the shared treasury pool. The pool is actively managed by Soroban smart contracts that deploy capital into yield strategies on the Stellar network.", bullets: ["Minimum $1 deposit", "XLM & USDC supported", "Instant FRAG minting", "No lock-up periods"] },
          { icon: "📈", color: "bg-emerald-500/10", title: "Automated Yield Distribution", desc: "Yield is distributed automatically on a weekly cycle through the yield_distributor Soroban contract. No manual claiming is required — balances update automatically on-chain.", bullets: ["Weekly distribution cycle", "Proportional to FRAG balance", "Auto-credited — no claiming needed", "12.5% APY target on testnet"] },
          { icon: "🔒", color: "bg-purple-500/10", title: "Proof of Reserves", desc: "Every FRAG token minted is backed 1:1 by real on-chain assets. The Reserve Ratio is calculated live from the Stellar Horizon API and Soroban contract state. No re-hypothecation. No leverage.", bullets: ["On-chain verification", "Real-time audit log", "100%+ reserve ratio", "No re-hypothecation"] },
          { icon: "🌐", color: "bg-orange-500/10", title: "Freighter Wallet Integration", desc: "Full integration with the official Stellar Freighter browser extension. Authentication is handled via signed challenge messages verified by JWT. No seed phrases stored on our servers.", bullets: ["Freighter & Albedo support", "No passwords stored", "JWT session management", "HttpOnly cookie security"] },
          { icon: "📊", color: "bg-pink-500/10", title: "Real-time Dashboard", desc: "Track your FRAG balance, USD value, transaction history, and yield earnings through a clean, real-time dashboard. Portfolio data is cached in Upstash Redis and reconciled with on-chain state on every deposit and withdrawal.", bullets: ["Live balance tracking", "Transaction history", "Portfolio chart", "Yield countdown timer"] },
        ].map((feature) => (
          <div key={feature.title} className="p-6 rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0 text-2xl`}>{feature.icon}</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h2>
                <p className="text-muted-foreground mb-4">{feature.desc}</p>
                <div className="grid grid-cols-2 gap-2">
                  {feature.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
