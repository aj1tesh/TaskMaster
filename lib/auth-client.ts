import { signOut } from "next-auth/react";
import { clearApiCache } from "@/lib/api";

export const LOGIN_PATH = "/login";
export const APP_HOME = "/dashboard";

/** Sign out and always land on /login (never rely on client redirect alone). */
export async function signOutToLogin() {
  clearApiCache();

  try {
    await signOut({ callbackUrl: LOGIN_PATH, redirect: false });
  } catch {
    // Session cookie may already be cleared — still navigate away.
  }

  window.location.assign(LOGIN_PATH);
}

/** After credentials sign-in, hard-navigate so server session + app shell load cleanly. */
export function signInToApp(path = APP_HOME) {
  window.location.assign(path);
}
