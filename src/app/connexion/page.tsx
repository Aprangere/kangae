import { Header } from "@/components/Header";
import { requestMagicLink } from "@/app/actions";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const envoye = params.envoye === "1";
  const erreur = params.erreur === "1";

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-16">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t(locale, "connexion.title")}
        </h1>
        <p className="text-ink-soft mt-1 mb-8">{t(locale, "connexion.subtitle")}</p>

        {envoye ? (
          <p className="rounded-xl border border-line bg-surface px-5 py-4">
            {t(locale, "connexion.sent")}
          </p>
        ) : (
          <form action={requestMagicLink} className="flex flex-col gap-4">
            {erreur && (
              <p className="text-sm text-salmon">{t(locale, "connexion.error")}</p>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {t(locale, "connexion.email")}
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder={t(locale, "connexion.emailPlaceholder")}
                className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink"
              />
            </label>
            <button
              type="submit"
              className="font-mono text-sm uppercase tracking-wide rounded-full bg-ink text-paper px-6 py-3 self-start hover:bg-ink/90 transition-colors"
            >
              {t(locale, "connexion.submit")}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
