export default function ArchitecturePage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Architecture</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">System Architecture</h1>
        <p className="text-muted-foreground">How all components of FragmentFi connect and interact with the Stellar Network.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Deposit Data Flow (with SDEX Path Payments)</h2>
          <div className="space-y-3">
            {[
              { from: "User (Freighter)", to: "Next.js Frontend", desc: "Selects Asset (XLM/USDC) & Path Payment preferences" },
              { from: "Frontend", to: "Stellar Testnet RPC", desc: "Generates atomic transaction (Swap + Deposit)" },
              { from: "RPC", to: "SDEX (Stellar DEX)", desc: "Executes PathPaymentStrictReceive to swap XLM -> USDC" },
              { from: "RPC", to: "Treasury Contract", desc: "Executes deposit_usdc(), mints SEP-41 FRAG" },
              { from: "Frontend", to: "Stellar Network", desc: "Polls for successful ledger confirmation" },
              { from: "Soroban", to: "Frontend (Events)", desc: "Emits env.events() stream directly to user dashboard" },
            ].map((flow, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border">
                <code className="text-xs font-mono text-primary">{flow.from}</code>
                <span className="text-muted-foreground text-sm">{"->"}</span>
                <code className="text-xs font-mono text-emerald-500">{flow.to}</code>
                <span className="text-xs text-muted-foreground sm:ml-auto">{flow.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Stellar Network Integrations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                SEP-10 Cryptographic Auth
              </h3>
              <p className="text-sm text-muted-foreground">We do not accept raw public keys. Users must cryptographically sign a zero-sequence XDR challenge transaction to authenticate via Freighter.</p>
            </div>
            
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                SEP-41 Token Standard
              </h3>
              <p className="text-sm text-muted-foreground">FRAG tokens strictly implement the Soroban Token Interface, supporting native allowances, cross-contract transfers, and full ecosystem interoperability.</p>
            </div>

            <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Soroban Event Streaming
              </h3>
              <p className="text-sm text-muted-foreground">All contract state changes emit native logs via <code>env.events()</code>, which are polled dynamically by our React frontend for real-time auditability.</p>
            </div>

            <div className="p-5 rounded-xl border border-orange-500/20 bg-orange-500/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                TTL Expiry Management
              </h3>
              <p className="text-sm text-muted-foreground">Contracts autonomously bump ledger TTL bounds via <code>extend_ttl()</code> to guarantee user balances and allowances are never archived.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
