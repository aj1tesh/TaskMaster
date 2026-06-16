import { LoadingScreen } from "@/components/layout/LoadingScreen";

export function LoadingViewportCenter({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
      {children ?? <LoadingScreen />}
    </div>
  );
}

export function LoadingOverlay({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-base/90">
      {children ?? <LoadingScreen />}
    </div>
  );
}
