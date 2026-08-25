import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — FragmentFi",
  description: "Learn how FragmentFi makes DeFi yield earning as simple as a bank deposit on Stellar.",
};

const steps = [
  {
    number: "01",
    icon: "🔗",
    title: "Connect Your Stellar Wallet",
    description: "Install the Freighter browser extension — the official Stellar wallet. FragmentFi uses a cryptographic signature challenge to verify your identity without ever accessing your private key or seed phrase.",
    detail: "We support Freighter and Albedo. No password. No KYC. Just your wallet.",
    color: "from-blue-500 to-blue-600",
    lightColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    number: "02",
    icon: "💰",
    title: "Deposit XLM or USDC",
    description: "Choose your asset and enter any amount starting from $1. FragmentFi builds and simulates the Soroban smart contract transaction locally, shows you the exact output, then sends it to Freighter for your approval.",
    detail: "Your transaction is simulated first — you always see exact amounts before confirming.",
    color: "from-emerald-500 to-emerald-600",
    lightColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    number: "03",
    icon: "⚡",
    title: "Receive FRAG Tokens Instantly",
    description: "The Treasury Pool Soroban contract mints FRAG tokens 1:1 to your deposit amount. FRAG is a yield-bearing token pegged to USD. Your tokens appear in your dashboard within seconds of blockchain confirmation.",
    detail: "FRAG: CAEDL2F6KBY65SFD2OMGZYIKAKCMVL4H2UDKQBPGRWHPEE3GMOXXAIRV",
    color: "from-purple-500 to-purple-600",
    lightColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    number: "04",
    icon: "📈",
    title: "Earn Automated Yield",
    description: "FragmentFi's Yield Distributor contract runs on a weekly schedule. It snapshots all FRAG holder balances and distributes yield proportionally. Your balance grows automatically — no claiming, no staking, no complexity.",
    detail: "Target APY: 12.5% (simulated on testnet). Yield distributed every 7 days.",
    color: "from-orange-500 to-orange-600",
    lightColor: "bg-orange-500/10 border-orange-500/20",
  },
  {
    number: "05",
    icon: "🏦",
    title: "Withdraw Anytime, Instantly",
    description: "Burn your FRAG tokens to redeem the underlying XLM at any time. The Treasury Pool contract processes the redemption on-chain in a single transaction. There are zero lock-up periods, fees, or delays.",
    detail: "Instant liquidity. No withdrawal queues. Always fully redeemable.",
    color: "from-pink-500 to-pink-600",
    lightColor: "bg-pink-500/10 border-pink-500/20",
  },
];

const techDetails = [
  { label: "Blockchain", value: "Stellar (Testnet)" },
  { label: "Smart Contracts", value: "Soroban / Rust" },
  { label: "Token Standard", value: "SEP-41 (Stellar)" },
  { label: "Frontend", value: "Next.js 16" },
  { label: "Auth", value: "Wallet Signature + JWT" },
  { label: "Yield Cycle", value: "Weekly (7 days)" },
  { label: "Reserve Ratio", value: "100%+ on-chain" },
  { label: "Min. Deposit", value: "$1 USD equiv." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-1/2 -translate-x-1/2 w-[80rem] aspect-square bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-transparent rounded-full" />
        </div>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
            Simple. Transparent. On-chain.
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-6">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">FragmentFi</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No banks. No middlemen. No complexity. Just deposit, earn, and withdraw — all powered by Soroban smart contracts on Stellar.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-emerald-500/30 to-transparent hidden sm:block" />
            <div className="space-y-16">
              {steps.map((step, i) => (
                <div key={i} className="relative flex gap-6 sm:gap-10">
                  {/* Step circle */}
                  <div className={`relative z-10 flex-shrink-0 h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-lg`}>
                    <span className="text-2xl sm:text-3xl">{step.icon}</span>
                    <span className="text-white/80 text-xs font-bold mt-1">{step.number}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-2 sm:pt-4">
                    <h2 className="text-2xl font-bold text-foreground mb-3">{step.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium text-foreground/80 ${step.lightColor}`}>
                      <span>💡</span>
                      <span>{step.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stats */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Under the Hood</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techDetails.map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-sm font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to earn yield?</h2>
          <p className="text-muted-foreground mb-8">Connect your Stellar wallet and start earning on testnet in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all"
            >
              Launch App →
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-8 py-3 text-sm font-semibold text-foreground border border-border hover:bg-muted transition-all"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
