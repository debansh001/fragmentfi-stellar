export default function FeedbackJourneyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-emerald-400">The Feedback Journey</h1>
        <p className="text-lg text-muted-foreground">
          How early user testing shaped FragmentFi into a robust, competition-ready platform.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-border pb-2">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          FragmentFi was built with a user-centric approach. From the very first beta deployment, we actively collected feedback from real users testing the platform on the Stellar Testnet. This feedback was critical in identifying hidden bugs, improving the user experience, and shaping the final architecture of the application.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-border pb-2">Key Iterations & Fixes</h2>
        
        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-bold text-primary">1. The Upstash Redis Scale-Up</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Problem:</strong> As users (like Niladri and Aman) began testing the platform heavily, the application suddenly started failing to record deposits and withdrawals, throwing 500 Internal Server Errors.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Fix:</strong> We discovered our free-tier Upstash Redis database had hit its hard limit of 500,000 requests. We immediately upgraded the infrastructure, ensuring the caching layer could handle competition-level traffic.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-bold text-primary">2. Graceful Error Handling for Smart Contracts</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Problem:</strong> Users reported a "whole bunch of error code" when trying to claim yield. This occurred when the Yield Distributor smart contract ran out of its XLM funding pool, causing the Stellar network to throw raw XDR HostErrors.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Fix:</strong> We wrote a custom XDR error decoder (`decodeErrorResult`) to catch these contract panics and translate them into human-readable UI alerts (e.g., "Insufficient XLM balance to pay for transaction fees"). We also manually topped up the Yield Distributor on the testnet with 9,000 XLM to resume payouts.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-bold text-primary">3. Wallet Authentication UX (txBadAuth)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Problem:</strong> If a user canceled a transaction in the Freighter wallet popup, the app would sometimes submit the unsigned transaction to the network anyway, resulting in an ugly `txBadAuth` JSON error on the frontend.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Fix:</strong> We improved the `useWallet` hook to explicitly check for Freighter rejection errors and gracefully abort the submission process, displaying a simple "Transaction cancelled in wallet" toast instead.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-bold text-primary">4. Dynamic UI Updates</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Problem:</strong> User Ayushi Nandi noted that the top wallet tab balance was not updating dynamically after a deposit, and requested a way to easily copy the wallet address.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The Fix:</strong> We implemented a custom `window.dispatchEvent` system. Now, immediately after a successful deposit or withdrawal, the top nav balance refreshes in real-time. We also added a one-click copy button to the wallet dropdown.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-border pb-2">Conclusion</h2>
        <p className="text-muted-foreground leading-relaxed">
          The continuous feedback loop transformed FragmentFi from a functional prototype into a polished, resilient, and user-friendly Web3 application ready for the main stage.
        </p>
      </section>
    </div>
  );
}
