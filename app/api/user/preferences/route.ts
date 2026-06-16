import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { User } from "@/models/User";
import { legacyThemeFromLevel } from "@/lib/theme-colors";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) return apiError("User not found", 404);

  return apiSuccess({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    googleLinked: !!user.googleId,
    hasPassword: !!user.passwordHash,
    preferences: user.preferences,
  });
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const body = await req.json();
  const user = await User.findById(userId);

  if (!user) return apiError("User not found", 404);

  if (!user.preferences) {
    user.preferences = { theme: "dark", defaultView: "list", weekStart: 0 };
  }
  if (body.theme) user.preferences.theme = body.theme;
  if (body.themeLevel !== undefined) {
    const level = Math.max(0, Math.min(100, Math.round(body.themeLevel)));
    user.preferences.themeLevel = level;
    user.preferences.theme = legacyThemeFromLevel(level);
  }
  if (body.defaultView) user.preferences.defaultView = body.defaultView;
  if (body.weekStart !== undefined) user.preferences.weekStart = body.weekStart;
  if (body.name) user.name = body.name;

  user.markModified("preferences");
  await user.save();

  return apiSuccess({
    name: user.name,
    avatar: user.avatar,
    googleLinked: !!user.googleId,
    hasPassword: !!user.passwordHash,
    preferences: user.preferences,
  });
}
