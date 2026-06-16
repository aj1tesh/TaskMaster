import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { User } from "@/models/User";

export async function DELETE() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  if (!user.passwordHash) {
    return apiError(
      "Add a password before disconnecting Google, or your account would be locked out.",
      400
    );
  }

  await User.updateOne({ _id: userId }, { $unset: { googleId: 1 } });

  return apiSuccess({ googleLinked: false });
}

export async function POST(_req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) return apiError("User not found", 404);

  return apiSuccess({
    googleLinked: !!user.googleId,
    hasPassword: !!user.passwordHash,
  });
}
