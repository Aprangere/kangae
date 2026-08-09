import Link from "next/link";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { getPointsMap, pointsKey } from "@/lib/points";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function Home() {
  const [latestPosts, pointsMap, locale] = await Promise.all([
    prisma.post.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { categories: true, natures: true },
    }),
    getPointsMap(),
    getLocale(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:min-h-[70vh]">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-4">
          {t(locale, "home.eyebrow")}
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl">
          {t(locale, "home.title")}
        </h1>
        <p className="text-ink-soft mt-5 max-w-xl text-lg">{t(locale, "home.subtitle")}</p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/explorer"
            className="font-mono text-sm uppercase tracking-wide rounded-full border-2 border-salmon text-salmon px-8 py-4 hover:bg-salmon hover:text-white transition-colors"
          >
            {t(locale, "home.cta.find")}
          </Link>
          <Link
            href="/nouveau"
            className="font-mono text-sm uppercase tracking-wide rounded-full bg-ink text-paper px-8 py-4 hover:bg-ink/90 transition-colors"
          >
            {t(locale, "home.cta.share")}
          </Link>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-4">
            {t(locale, "home.story.eyebrow")}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
            {t(locale, "home.story.body")}
          </p>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {t(locale, "home.latest")}
              </h2>
              <Link
                href="/explorer"
                className="font-mono text-xs uppercase tracking-wide text-salmon hover:underline"
              >
                {t(locale, "home.seeAll")}
              </Link>
            </div>
            <ul className="flex flex-col gap-3">
              {latestPosts.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    points={pointsMap.get(pointsKey(post)) ?? 0}
                    locale={locale}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
