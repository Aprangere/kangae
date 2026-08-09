import { Header } from "@/components/Header";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PostCard } from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { getPointsMap, pointsKey } from "@/lib/points";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

function toSlugArray(value: string | string[] | undefined): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value;
  return [];
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categorySlugs = toSlugArray(params.categorie);
  const natureSlugs = toSlugArray(params.nature);

  const [categories, natures, posts, pointsMap, locale] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.nature.findMany({ orderBy: { name: "asc" } }),
    prisma.post.findMany({
      where: {
        ...(categorySlugs.length > 0
          ? { categories: { some: { slug: { in: categorySlugs } } } }
          : {}),
        ...(natureSlugs.length > 0
          ? { natures: { some: { slug: { in: natureSlugs } } } }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { content: { contains: q } },
                { categories: { some: { name: { contains: q } } } },
              ],
            }
          : {}),
      },
      include: { categories: true, natures: true },
      orderBy: { createdAt: "desc" },
    }),
    getPointsMap(),
    getLocale(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10 flex flex-col md:flex-row gap-8">
        <FilterSidebar categories={categories} natures={natures} locale={locale} />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">
            {t(locale, "explorer.title")}
          </h1>

          {posts.length === 0 ? (
            <p className="font-mono text-sm text-ink-soft rounded-xl border border-dashed border-line px-5 py-8 text-center">
              {t(locale, "explorer.empty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    points={pointsMap.get(pointsKey(post)) ?? 0}
                    locale={locale}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
