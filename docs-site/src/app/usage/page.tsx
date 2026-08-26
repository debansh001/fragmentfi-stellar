
export default function UsagePage() {
  const steps = [
    { step: "01", color: "text-blue-500", bg: "bg-blue-500/10", title: "Install Freighter Wallet", content: "Download and install the Freighter browser extension from freighter.app — the official Stellar wallet. FragmentFi uses it for all transaction signing." },
    { step: "02", color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Switch to Testnet", content: "Open Freighter settings and switch to Testnet. Get free testnet XLM from Stellar Friendbot: https://friendbot.stellar.org/?addr=YOUR_STELLAR_ADDRESS" },
    { step: "03", color: "text-purple-500", bg: "bg-purple-500/10", title: "Connect Wallet", content: 'Click "Connect Wallet" in the top navigation bar. FragmentFi will request a signature from Freighter to authenticate you. This proves wallet ownership without storing any private key.' },
    { step: "04", color: "text-orange-500", bg: "bg-orange-500/10", title: "Deposit XLM", content: "Navigate to /deposit. Enter the amount of XLM to deposit. The UI shows the exact FRAG tokens you'll receive (1:1). Confirm the transaction in Freighter." },
    { step: "05", color: "text-pink-500", bg: "bg-pink-500/10", title: "Earn Yield Automatically", content: "After depositing, you automatically earn yield. The Yield Countdown timer on the dashboard shows when the next distribution is. No claiming needed." },
    { step: "06", color: "text-yellow-500", bg: "bg-yellow-500/10", title: "Withdraw Anytime", content: "Navigate to /withdraw. Enter the FRAG amount to redeem. Funds are returned as XLM instantly. Zero fees, zero lock-up periods, zero cooldowns." },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Usage Guide</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">How to Use FragmentFi</h1>
        <p className="text-muted-foreground">A step-by-step walkthrough for getting started on Stellar Testnet.</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.step} className="relative flex gap-6">
              <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${s.bg} border border-border font-bold text-sm ${s.color}`}>
                {s.step}
              </div>
              <div className="flex-1 pb-8">
                <h3 className={`text-lg font-semibold ${s.color} mb-2`}>{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
