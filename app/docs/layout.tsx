import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FragmentFi Docs",
  description: "Complete documentation for the FragmentFi DeFi protocol on Stellar.",
};

const docsSections = [
  {
    title: "Getting Started",
    links: [
      { name: "Overview", href: "/docs" },
      { name: "Features", href: "/docs/features" },
      { name: "Usage Guide", href: "/docs/usage" },
    ],
  },
  {
    title: "Technical",
    links: [
      { name: "Local Setup", href: "/docs/setup" },
      { name: "Implementation", href: "/docs/implementation" },
      { name: "Smart Contracts", href: "/docs/contracts" },
    ],
  },
  {
    title: "Security",
    links: [
      { name: "Architecture", href: "/docs/architecture" },
      { name: "Proof of Reserves", href: "/reserves" },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed top-16 bottom-0 border-r border-border bg-muted/20 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Documentation</p>
              <p className="text-xs text-muted-foreground">FragmentFi Protocol</p>
            </div>
          </div>

          <nav className="space-y-6">
            {docsSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-emerald-400/10 border border-blue-500/20">
            <p className="text-xs font-semibold text-foreground mb-1">Live on Testnet</p>
            <p className="text-xs text-muted-foreground">Try FragmentFi now on Stellar Testnet.</p>
            <Link href="/" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Launch App →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Mobile nav - show sections as horizontal scroll */}
        <div className="lg:hidden border-b border-border bg-background px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {docsSections.flatMap((s) => s.links).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 whitespace-nowrap transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
