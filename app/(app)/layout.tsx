import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { authOptions } from "@/lib/auth";
import { getFirstName } from "@/lib/theme-colors";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppDataProvider } from "@/components/providers/AppDataProvider";
import { TaskPanelProvider } from "@/components/tasks/TaskPanelContext";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";

const Sidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((m) => ({ default: m.Sidebar }))
);

const WelcomeSplash = dynamic(
  () =>
    import("@/components/layout/WelcomeSplash").then((m) => ({
      default: m.WelcomeSplash,
    })),
  { ssr: false }
);

const DesktopQuickAdd = dynamic(
  () =>
    import("@/components/layout/DesktopQuickAdd").then((m) => ({
      default: m.DesktopQuickAdd,
    })),
  { ssr: false }
);

const TaskDetail = dynamic(
  () =>
    import("@/components/tasks/TaskDetail").then((m) => ({
      default: m.TaskDetail,
    })),
  { ssr: false }
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const themeLevel = session.user.themeLevel ?? 0;
  const firstName = getFirstName(session.user.name);

  return (
    <SessionProvider session={session}>
      <ThemeProvider initialThemeLevel={themeLevel}>
        <AppDataProvider>
          <AuthGuard>
            <WelcomeSplash firstName={firstName} />
            <TaskPanelProvider>
              <div className="flex min-h-screen bg-base">
                <Sidebar />
                <main className="min-h-screen flex-1 overflow-auto pb-16 md:ml-sidebar md:pb-0">
                  <DesktopQuickAdd />
                  <AppShell>{children}</AppShell>
                </main>
                <TaskDetail />
              </div>
            </TaskPanelProvider>
          </AuthGuard>
        </AppDataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
