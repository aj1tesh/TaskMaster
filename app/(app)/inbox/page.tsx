import { InboxView } from "@/components/tasks/InboxView";

export default function InboxPage() {
  return (
    <div>
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-medium text-text-primary">Inbox</h1>
      </header>
      <InboxView />
    </div>
  );
}
