
export default function ArchitecturePage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Architecture</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">System Architecture</h1>
        <p className="text-muted-foreground">How all components of FragmentFi connect and interact.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Deposit Data Flow</h2>
          <div className="space-y-3">
            {[
              { from: "User (Freighter)", to: "Next.js Frontend", desc: "Signs XDR transaction" },
              { from: "Frontend", to: "Stellar Testnet RPC", desc: "Submits signed transaction" },
              { from: "RPC", to: "Treasury Contract", desc: "Executes deposit(), mints FRAG" },
              { from: "Frontend", to: "/api/deposit", desc: "Notifies backend with txHash" },
              { from: "Backend", to: "Stellar RPC", desc: "Polls for confirmed on-chain balance" },
              { from: "Backend", to: "Upstash Redis", desc: "Caches updated portfolio state" },
            ].map((flow, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border">
                <code className="text-xs font-mono text-primary">{flow.from}</code>
                <span className="text-muted-foreground text-sm">→</span>
                <code className="text-xs font-mono text-emerald-500">{flow.to}</code>
                <span className="text-xs text-muted-foreground sm:ml-auto">{flow.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Security Model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🔒", title: "On-chain Balance Authority", desc: "The server never trusts the client for balance amounts. It always fetches from the Stellar RPC and reconciles against the on-chain truth." },
              { icon: "🍪", title: "HttpOnly JWT Cookies", desc: "Session tokens are stored as HttpOnly cookies, inaccessible to JavaScript, preventing XSS-based token theft." },
              { icon: "✍️", title: "Signature-based Auth", desc: "No passwords or seed phrases stored. Authentication requires signing a server-issued challenge with your private key." },
              { icon: "🛡", title: "Soroban Contract Guards", desc: "All sensitive operations on-chain (mint, burn) require admin authorization enforced at the contract level in Rust." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-border">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">CI/CD Pipeline</h2>
          <div className="space-y-3">
            {[
              { file: ".github/workflows/lint.yml", desc: "Runs ESLint and TypeScript check on every push and PR" },
              { file: ".github/workflows/nextjs.yml", desc: "Builds the Next.js app and deploys to Vercel on push to main" },
              { file: ".github/workflows/contracts.yml", desc: "Builds Soroban WASM contracts, runs cargo test, deploys to testnet on push to main" },
            ].map((wf) => (
              <div key={wf.file} className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg border border-border">
                <code className="text-xs font-mono text-primary flex-shrink-0">{wf.file}</code>
                <p className="text-xs text-muted-foreground sm:ml-auto">{wf.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
