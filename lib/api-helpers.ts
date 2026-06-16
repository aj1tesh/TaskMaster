import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, error: null, meta } satisfies ApiResponse<T>, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message } satisfies ApiResponse<null>, { status });
}

export async function requireAuth() {
  const userId = await getAuthUserId();
  if (!userId) return { userId: null, error: apiError("Unauthorized", 401) };
  return { userId, error: null };
}
