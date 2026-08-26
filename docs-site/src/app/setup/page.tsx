
export default function SetupPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Local Setup</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">Running FragmentFi Locally</h1>
        <p className="text-muted-foreground">Complete guide to setting up the development environment from scratch.</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Prerequisites</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Node.js 20+", desc: "Required for Next.js frontend" },
              { name: "Rust & Cargo", desc: "Required for Soroban contracts" },
              { name: "Stellar CLI", desc: "For contract deployment" },
              { name: "Freighter Extension", desc: "For wallet connection" },
              { name: "Upstash Account", desc: "For Redis cache (free tier works)" },
              { name: "Git", desc: "To clone the repo" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Clone the Repository</h2>
          <pre className="bg-muted rounded-xl p-4 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
{`git clone https://github.com/debansh001/fragmentfi-stellar.git
cd fragmentfi-stellar
npm install`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Environment Variables</h2>
          <p className="text-muted-foreground mb-3 text-sm">Create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.env.local</code> file in the project root:</p>
          <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap">
{`JWT_SECRET=your_long_random_secret_here
CRON_SECRET=your_cron_secret_here

UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

NEXT_PUBLIC_FRAG_CONTRACT_ID=CAED...
NEXT_PUBLIC_TREASURY_CONTRACT_ID=CBKH...
NEXT_PUBLIC_YIELD_CONTRACT_ID=CBT7...

ADMIN_SECRET_KEY=SB34...`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Run Development Server</h2>
          <pre className="bg-muted rounded-xl p-4 text-sm font-mono text-foreground">npm run dev</pre>
          <p className="text-sm text-muted-foreground mt-2">Open <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Build Soroban Contracts</h2>
          <pre className="bg-muted rounded-xl p-4 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
{`rustup target add wasm32v1-none
cargo build --release --target wasm32v1-none
cargo test`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Run E2E Tests</h2>
          <pre className="bg-muted rounded-xl p-4 text-sm font-mono text-foreground">npx playwright test</pre>
        </section>
      </div>
    </div>
  );
}
