"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/layout/LoadingViewportCenter";
import { PREFETCH_ROUTES } from "@/lib/loading-messages";

const OVERLAY_DELAY_MS = 300;

function isInternalNavLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return false;
  if (anchor.target === "_blank" || anchor.download) return false;

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    const next = url.pathname.replace(/\/$/, "") || "/";
    const current = pathname.replace(/\/$/, "") || "/";
    return next !== current;
  } catch {
    return false;
  }
}

export function NavigationLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const prefetched = useRef(new Set<string>());
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPending(false);
    if (overlayTimer.current) {
      clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as Element).closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavLink(anchor, pathname)) return;

      overlayTimer.current = setTimeout(() => setPending(true), OVERLAY_DELAY_MS);
    }

    function handleNavStart() {
      overlayTimer.current = setTimeout(() => setPending(true), OVERLAY_DELAY_MS);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("app-navigation-start", handleNavStart);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("app-navigation-start", handleNavStart);
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
    };
  }, [pathname]);

  useEffect(() => {
    const current = pathname.replace(/\/$/, "") || "/";

    const prefetchAll = () => {
      for (const route of PREFETCH_ROUTES) {
        if (prefetched.current.has(route) || route === current) continue;
        prefetched.current.add(route);
        try {
          router.prefetch(route);
        } catch {
          prefetched.current.delete(route);
        }
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(prefetchAll);
      return () => cancelIdleCallback(id);
    }

    const t = setTimeout(prefetchAll, 100);
    return () => clearTimeout(t);
  }, [pathname, router]);

  return (
    <>
      {children}
      {pending && <LoadingOverlay />}
    </>
  );
}
