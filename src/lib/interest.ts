import { getCurrentUser } from "@/lib/auth";

/** Upvoting requires an account — returns null when signed out. */
export async function getVoterKey(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}
