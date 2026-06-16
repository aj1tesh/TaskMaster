"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { signOutToLogin } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const user = session?.user;

  if (!user) return null;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOutToLogin();
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-3 px-1 py-1">
        <UserAvatar name={user.name} src={user.image} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-primary">{user.name}</p>
          <p className="truncate text-xs text-text-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <Link
          href="/settings"
          className="flex flex-1 items-center justify-center gap-2 rounded border border-border py-2 text-xs text-text-muted hover:bg-raised hover:text-text-primary min-h-[44px]"
        >
          <Settings size={14} />
          Settings
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-border py-2 text-xs text-text-muted hover:bg-raised hover:text-text-primary min-h-[44px] disabled:opacity-50"
        >
          <LogOut size={14} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
