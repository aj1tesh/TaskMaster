import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { getBootstrapData } from "@/lib/bootstrap";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const data = await getBootstrapData(userId!);
    return apiSuccess(data);
  } catch (err) {
    console.error("[api/bootstrap]", err);
    return apiError("Database unavailable", 503);
  }
}
