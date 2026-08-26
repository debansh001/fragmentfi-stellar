import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FragmentFi Documentation",
  description: "Complete documentation for FragmentFi, a decentralized RWA platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-card p-6 hidden md:block">
            <h1 className="text-xl font-bold mb-8 text-primary">FragmentFi Docs</h1>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
              <Link href="/setup" className="text-sm font-medium hover:text-primary transition-colors">Setup & Dev</Link>
              <Link href="/usage" className="text-sm font-medium hover:text-primary transition-colors">Usage Guide</Link>
              <Link href="/implementation" className="text-sm font-medium hover:text-primary transition-colors">Implementation</Link>
              <Link href="/architecture" className="text-sm font-medium hover:text-primary transition-colors">Architecture</Link>
              <Link href="/contracts" className="text-sm font-medium hover:text-primary transition-colors">Contracts</Link>
              <div className="my-2 border-t border-border"></div>
              <Link href="/feedback-journey" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Feedback Journey</Link>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-8 md:p-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
