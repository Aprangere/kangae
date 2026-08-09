import Link from "next/link";
import type { Category, Nature, Post } from "@prisma/client";
import { timeAgo } from "@/lib/posts";
import { t, plural, translateCategory, translateNature, type Locale } from "@/lib/i18n";

type PostWithRelations = Post & { categories: Category[]; natures: Nature[] };

export function PostCard({
  post,
  points,
  locale,
}: {
  post: PostWithRelations;
  points: number;
  locale: Locale;
}) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-lg border border-line bg-surface px-5 py-4 hover:bg-paper transition-colors"
    >
      {(post.natures.length > 0 || post.categories.length > 0) && (
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          {[
            ...post.natures.map((n) => translateNature(locale, n.slug, n.name)),
            ...post.categories.map((c) => translateCategory(locale, c.slug, c.name)),
          ].join(" · ")}
        </p>
      )}
      <h3 className="font-display text-lg font-semibold mt-1.5">{post.title}</h3>
      <p className="text-ink-soft mt-1 line-clamp-2">{post.content}</p>
      <p className="font-mono text-xs text-ink-soft whitespace-nowrap mt-3 text-right">
        {post.authorName}
        {post.authorId && <span className="text-blue"> ✓</span>} · {points}{" "}
        {t(locale, "postcard.pts")} · {timeAgo(post.createdAt, locale)}
        {post.interestedCount > 0 &&
          ` · ${plural(locale, "postcard.interestedSuffix", post.interestedCount)}`}
      </p>
    </Link>
  );
}
