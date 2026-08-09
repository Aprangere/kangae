import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { LocaleToggle } from "@/components/LocaleToggle";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export async function Header() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const unreadCount = user
    ? await prisma.message.count({ where: { recipientId: user.id, readAt: null } })
    : 0;

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 gap-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Kangae
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/nouveau"
            className="font-mono text-sm uppercase tracking-wide rounded-full border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            {t(locale, "header.publish")}
          </Link>
          {user && (
            <Link
              href="/messages"
              className="font-mono text-sm uppercase tracking-wide rounded-full border border-line px-4 py-2 hover:border-ink transition-colors relative"
            >
              {t(locale, "header.messages")}
              {unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-orange text-white text-[10px] px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <form action={logout} className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-ink-soft">{user.email}</span>
              <button
                type="submit"
                className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
              >
                {t(locale, "header.logout")}
              </button>
            </form>
          ) : (
            <Link
              href="/connexion"
              className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink transition-colors whitespace-nowrap"
            >
              {t(locale, "header.login")}
            </Link>
          )}
          <LocaleToggle locale={locale} />
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
