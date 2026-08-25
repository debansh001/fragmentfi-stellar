
"use client";

import { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";

/**
 * Wraps any page that requires authentication.
 * Redirects to the landing page if the user is not logged in.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !address) {
      router.replace("/");
    }
  }, [address, isConnecting, router]);

  if (isConnecting) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!address) return null;

  return <>{children}</>;
}
