"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWalletButton from "./ConnectWalletButton";
import Image from "next/image";

const navLinks = [
  { name: "How It Works", href: "/how-it-works" },
  { name: "Reserves", href: "/reserves" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Check if current page is a public/marketing page
  const isPublicPage = ["/", "/how-it-works", "/contact"].includes(pathname) ||
    pathname?.startsWith("/how-it-works") ||
    pathname?.startsWith("/contact");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="FragmentFi Logo" width={32} height={32} className="object-contain rounded-md" />
            <span>FragmentFi</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1 text-sm font-medium flex-1">
          {isPublicPage && navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Wallet & Mobile Toggle */}
        <div className="flex items-center justify-end space-x-4">
          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background">
          <div className="flex flex-col space-y-2">
            {isPublicPage && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
