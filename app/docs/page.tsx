import Link from "next/link";

const quickLinks = [
  {
    icon: "⚡",
    title: "Features",
    description: "Explore fractional treasury pools, yield distribution, and proof of reserves.",
    href: "/docs/features",
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: "📖",
    title: "Usage Guide",
    description: "Step-by-step guide on connecting a wallet, depositing, and claiming yield.",
    href: "/docs/usage",
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    icon: "🛠",
    title: "Local Setup",
    description: "Clone the repo, set up env variables, and run FragmentFi on your machine.",
    href: "/docs/setup",
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40",
  },
  {
    icon: "🔬",
    title: "Implementation",
    description: "Deep dive into Soroban contracts, API routes, Redis caching, and the Stellar SDK.",
    href: "/docs/implementation",
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40",
  },
  {
    icon: "🔐",
    title: "Smart Contracts",
    description: "Learn about the FRAG Token, Treasury Pool, and Yield Distributor contracts.",
    href: "/docs/contracts",
    color: "from-pink-500/20 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40",
  },
  {
    icon: "🏛",
    title: "Architecture",
    description: "System design overview, data flow diagrams, and security model.",
    href: "/docs/architecture",
    color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40",
  },
];

export default function DocsIndexPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
          v1.0 — Stellar Testnet
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          FragmentFi Documentation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Welcome to the complete technical documentation for FragmentFi — the DeFi protocol built on Stellar Soroban that makes yield generation as simple as a bank deposit.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {quickLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`group p-6 rounded-xl bg-gradient-to-br border transition-all duration-200 ${item.color}`}
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* What is FragmentFi */}
      <div className="p-8 rounded-2xl border border-border bg-muted/30 mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">What is FragmentFi?</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>FragmentFi is a DeFi protocol built on the Stellar network using Soroban smart contracts. It allows users to deposit XLM or USDC and receive FRAG tokens — a yield-bearing stablecoin pegged 1:1 to USD.</p>
          <p>Every FRAG token is fully backed by on-chain reserves, verifiable in real-time through our Proof of Reserves dashboard. Users earn automated yield without managing complex positions, staking periods, or reward claims.</p>
          <p>Built for the Stellar hackathon, FragmentFi demonstrates how Soroban&apos;s high-throughput, low-cost smart contract platform can power institutional-grade DeFi accessible to everyone.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Smart Contracts", value: "4" },
          { label: "GitHub Actions", value: "3" },
          { label: "API Routes", value: "10+" },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-xl border border-border">
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
