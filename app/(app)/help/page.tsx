import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-lg font-medium text-text-primary">Help</h1>
        <p className="mt-1 text-sm text-text-muted">
          Quick reference. Full docs: <code className="font-mono text-xs">USER_GUIDE.md</code> in the project root.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">Quick add shorthand</h2>
        <ul className="space-y-1 text-sm text-text-muted">
          <li><code className="font-mono text-text-primary">#backend</code> — assign project by slug</li>
          <li><code className="font-mono text-text-primary">!high</code> — priority (low, medium, high, urgent)</li>
          <li><code className="font-mono text-text-primary">tomorrow</code> — due date (also: today, monday)</li>
        </ul>
        <p className="text-sm text-text-muted">
          Example: <code className="font-mono text-text-primary">Fix bug #backend !urgent tomorrow</code>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">Views</h2>
        <ul className="space-y-1 text-sm text-text-muted">
          <li><Link href="/inbox" className="text-text-primary hover:underline">Inbox</Link> — no project, no due date</li>
          <li><Link href="/today" className="text-text-primary hover:underline">Today</Link> — due today + overdue</li>
          <li><Link href="/upcoming" className="text-text-primary hover:underline">Upcoming</Link> — grouped by date</li>
          <li><Link href="/dashboard" className="text-text-primary hover:underline">Reports</Link> — time & completions</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">Keyboard shortcuts</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="font-mono text-text-muted">⌘K / Ctrl+K</dt>
          <dd className="text-text-primary">Command palette</dd>
          <dt className="font-mono text-text-muted">n</dt>
          <dd className="text-text-primary">Focus quick add</dd>
          <dt className="font-mono text-text-muted">f</dt>
          <dd className="text-text-primary">Focus filters</dd>
          <dt className="font-mono text-text-muted">?</dt>
          <dd className="text-text-primary">Shortcut cheatsheet</dd>
          <dt className="font-mono text-text-muted">Esc</dt>
          <dd className="text-text-primary">Close panel</dd>
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">Theme</h2>
        <p className="text-sm text-text-muted">
          Toggle dark/light from <Link href="/settings" className="text-text-primary hover:underline">Settings</Link> or the command palette. Your choice is saved to your account.
        </p>
      </section>
    </div>
  );
}
