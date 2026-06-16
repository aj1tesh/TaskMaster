import { UpcomingView } from "@/components/tasks/UpcomingView";

export default function UpcomingPage() {
  return (
    <div>
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-medium text-text-primary">Upcoming</h1>
      </header>
      <UpcomingView />
    </div>
  );
}
