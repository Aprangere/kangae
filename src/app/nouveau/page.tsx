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
      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight mb-4">
          {t(locale, "nouveau.title")}
        </h1>
        <p className="text-sm text-ink-soft mb-8">
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

        <form action={createPost} className="flex flex-col gap-6">
          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-2">
              {t(locale, "nouveau.nature")}
            </legend>
            <p className="text-xs text-ink-soft mb-2 -mt-1">{t(locale, "nouveau.multi")}</p>
            <div className="flex flex-wrap gap-2">
              {natures.map((n) => (
                <label key={n.id}>
                  <input type="checkbox" name="natures" value={n.slug} className="peer sr-only" />
                  <span className="block cursor-pointer rounded-full font-mono text-xs px-3.5 py-1.5 border border-line text-ink-soft peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white">
                    {translateNature(locale, n.slug, n.name)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {t(locale, "nouveau.titleLabel")}
            </span>
            <input
              type="text"
              name="title"
              required
              maxLength={120}
              placeholder={t(locale, "nouveau.titlePlaceholder")}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {t(locale, "nouveau.content")}
            </span>
            <textarea
              name="content"
              required
              rows={4}
              maxLength={600}
              placeholder={t(locale, "nouveau.contentPlaceholder")}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink resize-y"
            />
          </label>

          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-2">
              {t(locale, "nouveau.categories")}
            </legend>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((c) => (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.slug}
                    className="peer sr-only"
                  />
                  <span className="block cursor-pointer rounded-full font-mono text-xs px-3.5 py-1.5 border border-line text-ink-soft peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white">
                    {translateCategory(locale, c.slug, c.name)}
                  </span>
                </label>
              ))}
            </div>
            <input
              type="text"
              name="newCategories"
              placeholder={t(locale, "nouveau.newCategoriesPlaceholder")}
              className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink"
            />
            <span className="text-xs text-ink-soft mt-1 block">
              {t(locale, "nouveau.newCategoriesHint")}
            </span>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {t(locale, "nouveau.name")}
            </span>
            <input
              type="text"
              name="authorName"
              required
              maxLength={60}
              placeholder={t(locale, "nouveau.namePlaceholder")}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink"
            />
          </label>

          <button
            type="submit"
            className="font-mono text-sm uppercase tracking-wide rounded-full border-2 border-orange text-orange px-6 py-3 self-start hover:bg-orange hover:text-white transition-colors"
          >
            {t(locale, "nouveau.submit")}
          </button>
        </form>
      </main>
    </div>
  );
}
