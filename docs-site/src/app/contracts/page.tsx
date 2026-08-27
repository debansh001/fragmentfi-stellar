export default function ContractsPage() {
  const contracts = [
    {
      name: "FRAG Token",
      color: "border-blue-500/30 bg-blue-500/5",
      badge: "bg-blue-500/15 text-blue-500",
      id: "CA4BQ6NHOQ2TNI2PEHPK6KA7JQOF2SCPXO334HUGRSLALDL6YSRQOZKN",
      desc: "A fully compliant SEP-41 fungible token contract implementing the standard Stellar token interface. It includes strict Storage TTL management and Soroban Events.",
      fns: ["initialize(admin)", "mint(to, amount)", "burn(from, amount)", "burn_from(...)", "allowance(...)", "transfer_from(...)", "balance(id)", "transfer(from, to, amount)"],
    },
    {
      name: "Treasury Pool",
      color: "border-emerald-500/30 bg-emerald-500/5",
      badge: "bg-emerald-500/15 text-emerald-500",
      id: "CB7WUBMBWKWLIM2UR5S4FW7KYH3ZKSXXUWIJN3UK2PUZU6U56RIFOBLT",
      desc: "The core vault contract. Accepts XLM and USDC deposits, natively interfaces with the Stellar DEX for Path Payments, and manages the redemption mechanism.",
      fns: ["initialize(...)", "deposit(user, amount)", "deposit_usdc(...)", "withdraw(user, frag_amount)", "withdraw_usdc(...)", "get_pool_balance()"],
    },
    {
      name: "Yield Distributor",
      color: "border-purple-500/30 bg-purple-500/5",
      badge: "bg-purple-500/15 text-purple-500",
      id: "CCYD7AI3X5VLDQJCWC7EXCRNDQDYMEGJ6RPXLEDZDD4DNK576HGYMUAB",
      desc: "Calculates and distributes weekly yield. Performs cross-contract invocations via env.invoke_contract() directly to the Treasury Pool to calculate AUM on the fly.",
      fns: ["initialize(...)", "take_snapshot(user)", "distribute()", "claim_yield(user)"],
    }
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Smart Contracts</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">Soroban Contract Reference</h1>
        <p className="text-muted-foreground">FragmentFi utilizes a strict 3-contract Soroban architecture on the Stellar Testnet, written in Rust.</p>
      </div>

      <div className="space-y-8">
        {contracts.map((c) => (
          <div key={c.name} className={\ounded-2xl border p-6 \\}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-semibold text-foreground">{c.name}</h2>
            </div>
            <p className="text-sm font-mono text-muted-foreground break-all bg-background/50 p-2 rounded border mb-4">
              ID: {c.id}
            </p>
            <p className="text-foreground mb-6">{c.desc}</p>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Exported Functions</h4>
              <div className="flex flex-wrap gap-2">
                {c.fns.map((fn) => (
                  <span key={fn} className={\	ext-xs px-2.5 py-1 rounded-md font-mono \\}>
                    {fn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
