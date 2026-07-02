"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWalletButton from "./ConnectWalletButton";

import Image from "next/image";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="FragmentFi Logo" width={32} height={32} className="object-contain rounded-md" />
            <span>FragmentFi</span>
          </Link>
        </div>

        {/* Desktop Nav (Removed Dashboard and Deposit) */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
        </div>

        {/* Wallet & Mobile Toggle */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>
          
          <button onClick={toggleMenu} className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background">
          <div className="flex flex-col space-y-4">

            <ConnectWalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
