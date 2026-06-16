"use client";

import { useSession } from "next-auth/react";
import { LoadingViewportCenter } from "@/components/layout/LoadingViewportCenter";

/**
 * Waits for the client session to resolve before showing the app shell.
 * Protection is handled by the server layout; do not redirect to /login here —
 * that races with sign-in and bounces users back to login after a successful auth.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading" || status === "unauthenticated") {
    return <LoadingViewportCenter />;
  }

  return <>{children}</>;
}
