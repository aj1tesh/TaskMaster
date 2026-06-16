# ToDo — User Guide

A task manager for capturing, scheduling, and tracking work. This guide covers every major feature.

---

## Getting started

### Sign in

- **Email/password**: Use `/login` or `/register` (password must be at least 8 characters).
- **Google**: Click **Continue with Google** on the login page. Your profile photo syncs automatically.
- **Sign out**: Sidebar footer, or Settings → Session.
- **Link Google later**: Settings → Connected accounts → Connect (uses the same email as your account).

### Demo account (after seeding)

```
Email:    demo@todo.app
Password: demo1234
```

Run `npm run seed` to create the demo user with sample tasks and projects.

---

## Navigation

### Desktop (sidebar)

| Link | Purpose |
|------|---------|
| **Reports** | Time logged, completions, streak |
| **Today** | Due today + overdue + completed today |
| **Inbox** | Unprocessed tasks (no project, no due date) |
| **Upcoming** | Tasks grouped by date |
| **Settings** | Profile, theme, labels, account |
| **Projects** | Listed under sidebar Projects section |
| **Smart Lists** | Saved filters (appear after you create one) |

### Mobile (bottom tabs)

| Tab | Purpose |
|-----|---------|
| **Today** | Today's tasks |
| **Inbox** | Inbox triage |
| **Projects** | All projects |
| **Search** | Opens command palette (Cmd/Ctrl+K) |

The **+** button (bottom-right) focuses quick add on mobile.

---

## Tasks

### Quick add

Type in the bar at the top (desktop) or use the FAB (mobile). Press **Enter** or **Add**.

**Shorthand syntax** (tokens show inline before you submit):

| Syntax | Effect | Example |
|--------|--------|---------|
| `#slug` | Assign project by slug | `#backend` |
| `!priority` | Set priority | `!high`, `!urgent`, `!medium`, `!low` |
| `today` | Due today | `today` |
| `tomorrow` | Due tomorrow | `tomorrow` |
| `monday` | Due next Monday | `monday` |

**Example:**

```
Fix login bug #backend !high tomorrow
```

→ Title: "Fix login bug", project: backend, priority: high, due: tomorrow.

### Inbox

Tasks with **no project** and **no due date** land here. Use it to capture fast and triage later.

**Bulk actions** (select checkboxes):

- Assign project
- Set due date (tomorrow)
- Delete

### Today

- **Overdue** — past due dates (shown in accent orange, not red badges)
- **Today** — due today
- **Log completed** — tasks finished today

### Upcoming

Tasks grouped: **Today → Tomorrow → This week → Later**. Drag within a group to reorder.

### Task detail (click any task)

Opens a panel on the right (full screen on mobile):

- Title, description (markdown)
- Status, priority, project, labels
- Due date & reminder
- Recurrence (daily / weekly with day picker / monthly)
- Timer (start/stop, total vs estimate)
- Subtasks
- Activity log

Press **Esc** or click outside to close.

---

## Projects

Open from sidebar or **Projects** page. Each project has:

- **New project** — click on the Projects page or in the sidebar under Projects
- **List view** — drag to reorder tasks
- **Board view** — kanban columns (todo, in progress, done, blocked); drag cards between columns

Toggle list/board with the icons in the project header.

---

## Time tracking

- **Task row**: hover → play icon to start timer
- **Task detail**: Start/Stop button with running indicator
- **Sidebar footer** (desktop): shows active timer + elapsed time; stop from there
- Starting a new timer stops any other running timer

View weekly totals on **Reports** (`/dashboard`).

---

## Labels & filters

### Labels

Create in **Settings → Labels**. Assign in task detail via label chips.

### Filter bar (Inbox)

Filter by project, status, priority, label, or date range.

**Save as Smart List**: enter a name and click the bookmark icon. It appears in the sidebar under **Smart Lists**.

---

## Command palette

Press **Cmd+K** (Mac) or **Ctrl+K** (Windows).

- Search tasks
- Jump to projects
- Toggle theme
- Open settings

Use ↑/↓ to navigate, **Enter** to select, **Esc** to close.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `n` | Focus quick add |
| `f` | Focus filter bar |
| `?` | Show shortcut cheatsheet |
| `⌘K` / `Ctrl+K` | Command palette |
| `Esc` | Close panel or palette |

---

## Settings

### Theme

Click the sun/moon icon to switch **dark ↔ light**. Saves automatically to your account.

You can also toggle theme from the command palette (**Toggle theme**).

### Preferences

- **Default project view** — list or board for new project visits
- **Week starts on** — Sunday or Monday (affects upcoming grouping)

Click **Save preferences** to persist name, view, and week start.

### Danger zone

- **Sign out** — ends session
- **Delete account** — removes all your tasks, projects, labels, and timer data

---

## Recurrence

In task detail, set recurrence to daily, weekly, or monthly.

- **Weekly**: pick days (e.g. Mon, Wed)
- Summary shows human-readable text (e.g. "Every Mon, Wed")

When you mark a recurring task **done**, the next instance is created automatically with the next due date.

---

## Reports

**Reports** (`/dashboard`) shows:

- Tasks completed this week
- Completion streak (consecutive days)
- Total time logged
- Bar chart: time by project (this week)

---

## Troubleshooting

### Theme doesn't change

Theme is stored in your user profile and applied to the page root. If it seems stuck, hard-refresh (`Ctrl+Shift+R`) after saving. Toggle from Settings or command palette.

### Google sign-in fails

Check `.env`:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` matches your URL (e.g. `http://localhost:3000`)
- Google Console redirect URI: `http://localhost:3000/api/auth/callback/google`

### Seed script can't connect

Ensure `MONGODB_URI` is set in `.env` and MongoDB/Atlas is reachable.

### Tasks don't appear in Inbox

Inbox only shows tasks with **no project** and **no due date** that aren't done/cancelled. Assigning a project or due date removes them from Inbox.

---

## Environment variables (for self-hosting)

```env
MONGODB_URI=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...        # optional
GOOGLE_CLIENT_SECRET=...    # optional
```

See `.env.example` for a template.
