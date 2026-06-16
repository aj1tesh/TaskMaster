"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

const WELCOME_MS = 800;
const STORAGE_KEY = "todo-welcome-seen";

export function WelcomeSplash({ firstName }: { firstName: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      window.dispatchEvent(new CustomEvent("welcome-complete"));
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      window.dispatchEvent(new CustomEvent("welcome-complete"));
    }, WELCOME_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base"
      role="dialog"
      aria-label={`Welcome back, ${firstName}`}
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div>
          <p className="text-sm text-text-muted">Greetings</p>
          <h1 className="mt-1 text-2xl font-medium text-text-primary">
            Welcome back, {firstName}
          </h1>
        </div>
        <LoadingScreen />
      </div>
    </div>
  );
}
