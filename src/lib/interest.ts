import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/auth";

const ANON_COOKIE = "kangae_anon";

/** Read-only: never creates a cookie. Use in Server Components. */
export async function getVoterKey(): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) return `user:${user.id}`;

  const cookieStore = await cookies();
  const anon = cookieStore.get(ANON_COOKIE)?.value;
  return anon ? `anon:${anon}` : null;
}

/** Creates the anonymous cookie if missing. Use only in Server Actions/Route Handlers. */
export async function getOrCreateVoterKey(): Promise<string> {
  const user = await getCurrentUser();
  if (user) return `user:${user.id}`;

  const cookieStore = await cookies();
  let anon = cookieStore.get(ANON_COOKIE)?.value;
  if (!anon) {
    anon = randomBytes(16).toString("hex");
    cookieStore.set(ANON_COOKIE, anon, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return `anon:${anon}`;
}
