import Link from "next/link";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { createPost } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { t, translateCategory, translateNature } from "@/lib/i18n";

export default async function NewPostPage() {
  const [categories, natures, user, locale] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.nature.findMany({ orderBy: { name: "asc" } }),
    getCurrentUser(),
    getLocale(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight mb-1">
          {t(locale, "nouveau.title")}
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          {user ? (
            t(locale, "nouveau.connected", { email: user.email })
          ) : (
            <>
              {t(locale, "nouveau.notConnected")}{" "}
              <Link href="/connexion" className="text-blue hover:underline">
                {t(locale, "nouveau.connectLink")}
              </Link>{" "}
              {t(locale, "nouveau.connectSuffix")}
            </>
          )}
        </p>

        <form
          action={createPost}
          className="rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5 sm:py-5"
        >
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            placeholder={t(locale, "nouveau.titlePlaceholder")}
            className="w-full bg-transparent font-display text-lg font-semibold placeholder:font-normal placeholder:text-ink-soft focus:outline-none"
          />
          <textarea
            name="content"
            required
            rows={4}
            maxLength={600}
            placeholder={t(locale, "nouveau.contentPlaceholder")}
            className="w-full bg-transparent mt-2 resize-none leading-relaxed placeholder:text-ink-soft focus:outline-none"
          />

          {!user && (
            <input
              type="text"
              name="authorName"
              required
              maxLength={60}
              placeholder={t(locale, "nouveau.namePlaceholder")}
              className="w-full bg-transparent mt-3 pt-3 border-t border-line font-mono text-sm placeholder:text-ink-soft focus:outline-none"
            />
          )}

          <details className="group mt-3 pt-3 border-t border-line">
            <summary className="cursor-pointer list-none select-none inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink">
              <span className="inline-block leading-none transition-transform group-open:rotate-45">
                +
              </span>
              {t(locale, "nouveau.addTags")}
            </summary>

            <div className="mt-3 flex flex-col gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-1.5">
                  {t(locale, "nouveau.nature")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {natures.map((n) => (
                    <label key={n.id}>
                      <input type="checkbox" name="natures" value={n.slug} className="peer sr-only" />
                      <span className="block cursor-pointer rounded-full font-mono text-xs px-3 py-1 border border-line text-ink-soft peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white">
                        {translateNature(locale, n.slug, n.name)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-1.5">
                  {t(locale, "nouveau.categories")}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((c) => (
                    <label key={c.id}>
                      <input
                        type="checkbox"
                        name="categories"
                        value={c.slug}
                        className="peer sr-only"
                      />
                      <span className="block cursor-pointer rounded-full font-mono text-xs px-3 py-1 border border-line text-ink-soft peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white">
                        {translateCategory(locale, c.slug, c.name)}
                      </span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="newCategories"
                  placeholder={t(locale, "nouveau.newCategoriesPlaceholder")}
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink"
                />
                <span className="text-xs text-ink-soft mt-1 block">
                  {t(locale, "nouveau.newCategoriesHint")}
                </span>
              </div>
            </div>
          </details>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
            <button
              type="button"
              disabled
              title={t(locale, "nouveau.mediaSoon")}
              aria-label={t(locale, "nouveau.mediaSoon")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft/50 cursor-not-allowed"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h12v5.6l-2.5-2.4a1 1 0 0 0-1.4.03L9.3 12.2 7.2 10.4a1 1 0 0 0-1.3 0L4 12.1V6Zm3 2.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              type="submit"
              className="font-mono text-sm uppercase tracking-wide rounded-full border-2 border-orange text-orange px-6 py-2.5 hover:bg-orange hover:text-white transition-colors"
            >
              {t(locale, "nouveau.submit")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
