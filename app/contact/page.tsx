
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — FragmentFi",
  description: "Get in touch with the FragmentFi team.",
};

const contactMethods = [
  { icon: "🐙", title: "GitHub", desc: "Browse the source code, open issues, or submit pull requests.", cta: "View Repository", href: "https://github.com/debansh001/fragmentfi-stellar", color: "border-gray-500/30 hover:border-gray-400/60 bg-gray-500/5", badge: "bg-gray-500/15 text-gray-400" },
  { icon: "🐛", title: "Bug Reports", desc: "Found an issue? Open a detailed GitHub Issue with steps to reproduce.", cta: "Open an Issue", href: "https://github.com/debansh001/fragmentfi-stellar/issues", color: "border-red-500/30 hover:border-red-500/60 bg-red-500/5", badge: "bg-red-500/15 text-red-400" },
  { icon: "💬", title: "Email", desc: "For collaboration, partnerships, or private security disclosures.", cta: "debanshtiwarii21@gmail.com", href: "mailto:debanshtiwarii21@gmail.com", color: "border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5", badge: "bg-blue-500/15 text-blue-400" },
  { icon: "🌐", title: "Stellar Network", desc: "View the live contracts and transactions on the Stellar Testnet explorer.", cta: "Open Explorer", href: "https://stellar.expert/explorer/testnet", color: "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5", badge: "bg-emerald-500/15 text-emerald-400" },
];

const contractAddresses = [
  { name: "FRAG Token", id: "CAEDL2F6KBY65SFD2OMGZYIKAKCMVL4H2UDKQBPGRWHPEE3GMOXXAIRV" },
  { name: "Treasury Pool", id: "CBKHZFGHG3K7XLKHCIEKGKSNZS2M2QY5ABZJFNBFSNJE4HEN6OMAW6EW" },
  { name: "Yield Distributor", id: "CBT7IR4OYDQMAKZTJFJ3FA5JWSEBI5U7QXFM4TYCGDZ35SOOVKIZFPNS" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none">
          <div className="relative left-1/2 -translate-x-1/2 w-[60rem] aspect-square bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full" />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-6">
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">
              Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Have a question, a bug report, or want to collaborate on Stellar DeFi? We are here.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-6 rounded-2xl border transition-all duration-200 ${method.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{method.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${method.badge}`}>External</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{method.desc}</p>
                    <span className="text-sm font-medium text-primary group-hover:underline">{method.cta} →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contract Addresses */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Contract Addresses</h2>
          <p className="text-muted-foreground mb-8">All contracts are deployed on Stellar Testnet and fully open-source.</p>
          <div className="space-y-4">
            {contractAddresses.map((contract) => (
              <div key={contract.name} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-xl border border-border bg-background">
                <span className="text-sm font-semibold text-foreground min-w-[140px]">{contract.name}</span>
                <code className="text-xs font-mono text-muted-foreground break-all">{contract.id}</code>
                <a
                  href={"https://stellar.expert/explorer/testnet/contract/" + contract.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline sm:ml-auto flex-shrink-0"
                >
                  View on Explorer →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8">Built by</h2>
          <div className="flex items-center gap-6 p-6 rounded-2xl border border-border bg-muted/20">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              D
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Debansh</p>
              <p className="text-muted-foreground text-sm">Fullstack developer passionate about Stellar DeFi and decentralized finance accessibility.</p>
              <div className="flex gap-3 mt-3">
                <a href="https://github.com/debansh001" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">GitHub →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">Ready to explore?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              Launch App
            </Link>
            <Link href="https://fragmentfi-docs.vercel.app" target="_blank" rel="noopener noreferrer" className="rounded-full px-8 py-3 text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors">
              Read Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}