"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Nature } from "@prisma/client";
import { t, translateCategory, translateNature, type Locale } from "@/lib/i18n";

export function FilterSidebar({
  categories,
  natures,
  locale,
}: {
  categories: Category[];
  natures: Nature[];
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const activeCategories = searchParams.getAll("categorie");
  const activeNatures = searchParams.getAll("nature");

  function navigate(params: URLSearchParams) {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function setQueryParam(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    navigate(params);
  }

  function toggleMulti(paramName: string, slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(paramName);
    params.delete(paramName);
    const next = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    for (const c of next) params.append(paramName, c);
    navigate(params);
  }

  return (
    <aside className="w-full md:w-64 shrink-0 bg-blue-bg border border-blue-soft rounded-xl p-5 h-fit md:sticky md:top-6">
      <p className="font-mono text-xs uppercase tracking-wide text-blue mb-3">
        {t(locale, "sidebar.search")}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQueryParam(query);
        }}
        className="mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(locale, "sidebar.searchPlaceholder")}
          className="w-full rounded-full border border-blue-soft bg-surface px-4 py-2.5 text-sm placeholder:text-ink-soft focus:outline-none focus:border-blue"
        />
      </form>

      <p className="font-mono text-xs uppercase tracking-wide text-blue mb-3">
        {t(locale, "sidebar.nature")}
      </p>
      <p className="text-xs text-ink-soft mb-2 -mt-1">{t(locale, "sidebar.multi")}</p>
      <div className="flex flex-col gap-1.5 mb-6">
        {natures.map((n) => (
          <button
            key={n.id}
            onClick={() => toggleMulti("nature", n.slug)}
            className={`font-mono text-xs rounded-full px-3.5 py-2 border text-left transition-colors ${
              activeNatures.includes(n.slug)
                ? "border-blue bg-blue text-white"
                : "border-blue-soft text-ink-soft hover:border-blue"
            }`}
          >
            {translateNature(locale, n.slug, n.name)}
          </button>
        ))}
      </div>

      <p className="font-mono text-xs uppercase tracking-wide text-blue mb-3">
        {t(locale, "sidebar.categories")}
      </p>
      <p className="text-xs text-ink-soft mb-2 -mt-1">{t(locale, "sidebar.multi")}</p>
      <div className="flex flex-col gap-1.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleMulti("categorie", c.slug)}
            className={`font-mono text-xs rounded-full px-3.5 py-2 border text-left transition-colors ${
              activeCategories.includes(c.slug)
                ? "border-blue bg-blue text-white"
                : "border-blue-soft text-ink-soft hover:border-blue"
            }`}
          >
            {translateCategory(locale, c.slug, c.name)}
          </button>
        ))}
      </div>
    </aside>
  );
}
