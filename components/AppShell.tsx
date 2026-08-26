"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import AuthGuard from "./AuthGuard";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Deposit", href: "/deposit", icon: DepositIcon },
  { name: "Withdraw", href: "/withdraw", icon: WithdrawIcon },
  { name: "Reserves", href: "/reserves", icon: ReservesIcon },
  { name: "History", href: "/history", icon: HistoryIcon },
  { name: "Profile", href: "/profile", icon: ProfileIcon },
];

const publicPages = ["/", "/how-it-works", "/contact", "/docs"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No sidebar for public/marketing pages and docs
  const isPublicPage = publicPages.includes(pathname) ||
    pathname?.startsWith("/docs") ||
    pathname?.startsWith("/how-it-works") ||
    pathname?.startsWith("/contact");

  const isProtected = !isPublicPage;

  const content = (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-muted/40 md:flex">
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="grid gap-2 text-sm font-medium">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );

  if (isPublicPage) {
    return <main className="flex-1">{children}</main>;
  }

  if (isProtected) {
    return <AuthGuard>{content}</AuthGuard>;
  }

  return content;
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function DepositIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function WithdrawIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ReservesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
