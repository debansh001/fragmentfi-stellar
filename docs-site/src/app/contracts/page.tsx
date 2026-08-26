
export default function ContractsPage() {
  const contracts = [
    {
      name: "FRAG Token",
      color: "border-blue-500/30 bg-blue-500/5",
      badge: "bg-blue-500/15 text-blue-500",
      id: "CAEDL2F6KBY65SFD2OMGZYIKAKCMVL4H2UDKQBPGRWHPEE3GMOXXAIRV",
      desc: "A fully compliant SEP-41 fungible token contract implementing the standard Stellar token interface.",
      fns: ["initialize(admin, decimals, name, symbol)", "mint(to, amount)", "burn(from, amount)", "balance(id)", "transfer(from, to, amount)"],
    },
    {
      name: "Treasury Pool",
      color: "border-emerald-500/30 bg-emerald-500/5",
      badge: "bg-emerald-500/15 text-emerald-500",
      id: "CBKHZFGHG3K7XLKHCIEKGKSNZS2M2QY5ABZJFNBFSNJE4HEN6OMAW6EW",
      desc: "The core vault contract. Accepts XLM/USDC deposits, mints FRAG, and manages the redemption mechanism.",
      fns: ["initialize(admin, frag_token, yield_dist)", "deposit(user, amount)", "withdraw(user, frag_amount)", "get_total_reserves()"],
    },
    {
      name: "Yield Distributor",
      color: "border-purple-500/30 bg-purple-500/5",
      badge: "bg-purple-500/15 text-purple-500",
      id: "CBT7IR4OYDQMAKZTJFJ3FA5JWSEBI5U7QXFM4TYCGDZ35SOOVKIZFPNS",
      desc: "Calculates and distributes weekly yield to FRAG holders proportionally based on their balance at snapshot time.",
      fns: ["initialize(admin, frag_token)", "take_snapshot(user)", "distribute_yield(pool_balance)", "claim_yield(user)"],
    },
    {
      name: "FragmentFi Core",
      color: "border-orange-500/30 bg-orange-500/5",
      badge: "bg-orange-500/15 text-orange-500",
      id: "Core orchestration contract",
      desc: "The main orchestration contract that coordinates the treasury pool and yield distributor.",
      fns: ["initialize(admin)", "set_apy(rate)", "get_protocol_stats()"],
    },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-2">Smart Contracts</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">Soroban Contract Reference</h1>
        <p className="text-muted-foreground">FragmentFi deploys 4 Soroban contracts on Stellar Testnet, all written in Rust.</p>
      </div>

      <div className="space-y-8">
        {contracts.map((c) => (
          <div key={c.name} className={`rounded-2xl border p-6 ${c.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-semibold text-foreground">{c.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>Soroban</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Contract ID (Testnet)</p>
              <code className="text-xs bg-background/80 rounded-lg px-3 py-1.5 font-mono text-foreground/80 break-all block">{c.id}</code>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Functions</p>
              <div className="space-y-1.5">
                {c.fns.map((fn) => (
                  <code key={fn} className="block text-xs bg-background/80 px-3 py-1.5 rounded font-mono text-foreground/80">{fn}</code>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
