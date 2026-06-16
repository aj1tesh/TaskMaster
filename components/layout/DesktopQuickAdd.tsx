"use client";

import { useRouter } from "next/navigation";
import { QuickAdd } from "@/components/tasks/QuickAdd";

export function DesktopQuickAdd() {
  const router = useRouter();
  return (
    <div className="hidden border-b border-border bg-surface md:block">
      <QuickAdd
        onCreated={() => router.refresh()}
        placeholder="Fix login bug #backend !high tomorrow"
      />
    </div>
  );
}
