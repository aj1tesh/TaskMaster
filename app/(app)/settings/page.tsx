"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { ThemeSlider } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { api, type LabelDTO } from "@/lib/api";
import { Trash2, Check, LogOut, Link2, Unlink } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { signOutToLogin } from "@/lib/auth-client";

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  googleLinked: boolean;
  hasPassword: boolean;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { themeLevel } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [defaultView, setDefaultView] = useState<"list" | "board">("list");
  const [weekStart, setWeekStart] = useState<0 | 1>(0);
  const [labels, setLabels] = useState<LabelDTO[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/preferences").then((r) => r.json()),
      api.labels.list(),
    ]).then(([prefsRes, labelsRes]) => {
      if (prefsRes.data) {
        const d = prefsRes.data;
        setProfile({
          name: d.name,
          email: d.email,
          avatar: d.avatar,
          googleLinked: !!d.googleLinked,
          hasPassword: !!d.hasPassword,
        });
        setName(d.name || "");
        if (d.preferences?.defaultView) setDefaultView(d.preferences.defaultView);
        if (d.preferences?.weekStart !== undefined) setWeekStart(d.preferences.weekStart);
      }
      if (labelsRes.data) setLabels(labelsRes.data);
      setLoading(false);
    });
  }, []);

  async function savePreferences() {
    const res = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, defaultView, weekStart }),
    });
    const json = await res.json();
    if (json.data) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await update({ name });
      setProfile((p) => (p ? { ...p, name } : p));
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/user", { method: "PATCH", body: form });
    const json = await res.json();
    setUploading(false);
    if (json.data?.avatar) {
      setProfile((p) => (p ? { ...p, avatar: json.data.avatar } : p));
      await update({ image: json.data.avatar });
    }
  }

  async function connectGoogle() {
    setGoogleBusy(true);
    await signIn("google", { callbackUrl: "/settings" });
  }

  async function disconnectGoogle() {
    if (!profile?.hasPassword) {
      alert("Set a password first so you can still sign in after disconnecting Google.");
      return;
    }
    if (!confirm("Disconnect Google from this account?")) return;
    setGoogleBusy(true);
    const res = await fetch("/api/user/google", { method: "DELETE" });
    const json = await res.json();
    setGoogleBusy(false);
    if (json.data) {
      setProfile((p) => (p ? { ...p, googleLinked: false } : p));
      await update();
    } else if (json.error) {
      alert(json.error);
    }
  }

  async function addLabel() {
    if (!newLabel.trim()) return;
    const { data } = await api.labels.create({ name: newLabel.trim() });
    if (data) {
      setLabels((prev) => [...prev, data]);
      setNewLabel("");
    }
  }

  async function deleteLabel(id: string) {
    await api.labels.delete(id);
    setLabels((prev) => prev.filter((l) => l.id !== id));
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all data? This cannot be undone.")) return;
    await fetch("/api/user", { method: "DELETE" });
    await signOutToLogin();
  }

  const avatarSrc = profile?.avatar || session?.user?.image;

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-32 animate-pulse-flat rounded" />
        <div className="h-24 animate-pulse-flat rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-text-primary">Settings</h1>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Check size={14} /> Saved
          </span>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-primary">Profile</h2>
        <div className="flex items-center gap-4">
          <UserAvatar name={name} src={avatarSrc} size={64} />
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload photo"}
            </Button>
            <p className="text-xs text-text-muted">
              Google sign-in syncs your profile photo automatically.
            </p>
          </div>
        </div>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-xs text-text-muted">{profile?.email || session?.user?.email}</p>
        <Button variant="primary" size="sm" onClick={savePreferences}>
          Save profile
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-primary">Preferences</h2>
        <div className="rounded border border-border p-3">
          <div className="mb-3">
            <span className="text-sm text-text-primary">Theme</span>
            <p className="text-xs text-text-muted">
              Drag from dark to light ({themeLevel < 50 ? "dark" : "light"})
            </p>
          </div>
          <ThemeSlider />
        </div>
        <Select
          label="Default project view"
          value={defaultView}
          onValueChange={(v) => setDefaultView(v as "list" | "board")}
          options={[
            { value: "list", label: "List" },
            { value: "board", label: "Board" },
          ]}
        />
        <Select
          label="Week starts on"
          value={String(weekStart)}
          onValueChange={(v) => setWeekStart(Number(v) as 0 | 1)}
          options={[
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
          ]}
        />
        <Button variant="secondary" size="sm" onClick={savePreferences}>
          Save preferences
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-primary">Labels</h2>
        <div className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New label"
            onKeyDown={(e) => e.key === "Enter" && addLabel()}
          />
          <Button variant="primary" size="sm" onClick={addLabel}>Add</Button>
        </div>
        {labels.length === 0 ? (
          <p className="text-sm text-text-muted">No labels yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded border border-border">
            {labels.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: l.colorHex }} />
                  {l.name}
                </span>
                <button
                  onClick={() => deleteLabel(l.id)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-red-500"
                  aria-label={`Delete ${l.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-primary">Connected accounts</h2>
        <div className="flex items-center justify-between rounded border border-border p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded border border-border bg-raised text-sm font-medium">
              G
            </span>
            <div>
              <p className="text-sm text-text-primary">Google</p>
              <p className="text-xs text-text-muted">
                {profile?.googleLinked ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          {profile?.googleLinked ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={googleBusy}
              onClick={disconnectGoogle}
            >
              <Unlink size={14} className="mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={googleBusy}
              onClick={connectGoogle}
            >
              <Link2 size={14} className="mr-1" />
              Connect
            </Button>
          )}
        </div>
        {!profile?.hasPassword && profile?.googleLinked && (
          <p className="text-xs text-text-muted">
            You sign in with Google only. Register a password via account recovery is not implemented — disconnecting Google would lock you out.
          </p>
        )}
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-text-primary">Session</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void signOutToLogin()}
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </Button>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-red-500">Danger zone</h2>
        <Button variant="danger" size="sm" onClick={deleteAccount}>
          Delete account
        </Button>
      </section>
    </div>
  );
}
