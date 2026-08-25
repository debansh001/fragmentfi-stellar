
export default function ImplementationPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Implementation</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">Technical Implementation</h1>
        <p className="text-muted-foreground">Deep dive into the architecture, API design, smart contract interactions, and security model.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Next.js 16", role: "Frontend & API" },
              { name: "Soroban / Rust", role: "Smart Contracts" },
              { name: "@stellar/stellar-sdk", role: "Blockchain RPC" },
              { name: "Upstash Redis", role: "State Cache" },
              { name: "Jose JWT", role: "Auth Tokens" },
              { name: "Tailwind CSS 4", role: "Styling" },
              { name: "Playwright", role: "E2E Testing" },
              { name: "GitHub Actions", role: "CI / CD" },
              { name: "Vercel", role: "Deployment" },
            ].map((t) => (
              <div key={t.name} className="p-3 rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Stellar SDK Integration</h2>
          <p className="text-muted-foreground mb-4 text-sm">All Soroban contract interactions are handled in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">lib/stellar.ts</code> using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@stellar/stellar-sdk</code>:</p>
          <pre className="bg-muted rounded-xl p-4 text-xs font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap">
{`import { TransactionBuilder, Contract, rpc,
  nativeToScVal, scValToNative, Address } from '@stellar/stellar-sdk';

export async function buildDepositTransaction(
  sourceAddress: string, amountStr: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  const contract = new Contract(TREASURY_CONTRACT_ID);
  const tx = new TransactionBuilder(account, { fee: '100000', ... })
    .addOperation(contract.call("deposit", ...))
    .build();
  // Simulate first to attach ledger footprint
  const sim = await getServer().simulateTransaction(tx);
  return rpc.assembleTransaction(tx, sim).build().toXDR();
}`}
          </pre>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Authentication Flow</h2>
          <div className="space-y-3">
            {[
              "Server generates a random 32-byte challenge, cached in Redis for 5 minutes",
              "Frontend sends the challenge to Freighter to sign with the user's private key",
              "Server verifies the signature against the wallet's public key using stellar-sdk",
              "On success, a JWT is issued and stored as an HttpOnly cookie for 7 days",
              "All protected API routes verify the JWT and extract the wallet address from the payload",
            ].map((desc, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <p className="text-sm text-muted-foreground pt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">API Routes</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-foreground">Route</th>
                  <th className="text-left px-4 py-2 font-semibold text-foreground">Method</th>
                  <th className="text-left px-4 py-2 font-semibold text-foreground hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { route: "/api/auth/verify", method: "POST", desc: "Verify wallet signature, issue JWT" },
                  { route: "/api/me", method: "GET", desc: "Get current user session info" },
                  { route: "/api/deposit", method: "POST", desc: "Record deposit, sync on-chain balance" },
                  { route: "/api/withdraw", method: "POST", desc: "Record withdrawal, sync on-chain balance" },
                  { route: "/api/portfolio", method: "GET", desc: "Fetch current FRAG balance" },
                  { route: "/api/history", method: "GET", desc: "Get paginated transaction history" },
                  { route: "/api/reserves", method: "GET", desc: "Fetch on-chain reserve data" },
                  { route: "/api/public/stats", method: "GET", desc: "Public protocol statistics" },
                  { route: "/api/yield/claim", method: "POST", desc: "Trigger yield claim transaction" },
                  { route: "/api/cron", method: "POST", desc: "Scheduled yield distribution job" },
                ].map((r) => (
                  <tr key={r.route} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{r.route}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.method === "GET" ? "bg-blue-500/15 text-blue-500" : "bg-orange-500/15 text-orange-500"}`}>{r.method}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
