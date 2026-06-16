"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export function SessionProvider({
  session,
  children,
}: {
  session?: Session | null;
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
