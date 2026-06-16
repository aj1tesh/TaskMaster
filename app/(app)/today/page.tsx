import { TodayView } from "@/components/tasks/TodayView";

export default function TodayPage() {
  return (
    <div>
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-medium text-text-primary">Today</h1>
      </header>
      <TodayView />
    </div>
  );
}
