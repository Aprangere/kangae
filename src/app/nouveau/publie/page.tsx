import Link from "next/link";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function PostPublishedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const id = typeof params.id === "string" ? params.id : undefined;
  const post = id
    ? await prisma.post.findUnique({ where: { id }, select: { id: true, title: true } })
    : null;

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
            <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t(locale, "partage.title")}
        </h1>
        {post && (
          <p className="text-ink-soft mt-2">
            {t(locale, "partage.subtitle", { title: post.title })}
          </p>
        )}

        <div className="flex flex-col items-center gap-3 mt-8">
          {post && (
            <Link
              href={`/post/${post.id}`}
              className="font-mono text-sm uppercase tracking-wide rounded-full bg-orange text-white px-6 py-3 hover:bg-orange/90 transition-colors"
            >
              {t(locale, "partage.viewCta")}
            </Link>
          )}
          <Link
            href="/nouveau"
            className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
          >
            {t(locale, "partage.anotherCta")}
          </Link>
        </div>
      </main>
    </div>
  );
}
