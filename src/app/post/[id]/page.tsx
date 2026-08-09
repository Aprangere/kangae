import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { markInterested, sendMessage } from "@/app/actions";
import { timeAgo } from "@/lib/posts";
import { getPostAuthorPoints } from "@/lib/points";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getVoterKey } from "@/lib/interest";
import { t, plural, translateCategory, translateNature } from "@/lib/i18n";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, viewer, locale, voterKey] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { categories: true, natures: true },
    }),
    getCurrentUser(),
    getLocale(),
    getVoterKey(),
  ]);

  if (!post) notFound();

  const points = await getPostAuthorPoints(post);
  const isOwnPost = viewer?.id === post.authorId;
  const hasVoted = voterKey
    ? Boolean(
        await prisma.interest.findUnique({
          where: { postId_voterKey: { postId: post.id, voterKey } },
        })
      )
    : false;

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-10">
        {(post.natures.length > 0 || post.categories.length > 0) && (
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            {[
              ...post.natures.map((n) => translateNature(locale, n.slug, n.name)),
              ...post.categories.map((c) => translateCategory(locale, c.slug, c.name)),
            ].join(" · ")}
          </p>
        )}

        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
          {post.title}
        </h1>

        <p className="font-mono text-xs text-ink-soft mt-2">
          {post.authorName}
          {post.authorId && <span className="text-blue"> {t(locale, "post.verified")}</span>} ·{" "}
          {points} {t(locale, "postcard.pts")} · {timeAgo(post.createdAt, locale)}
        </p>

        <p className="mt-6 text-lg leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        <div className="mt-10 rounded-lg border border-line bg-surface px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm">
            {post.interestedCount === 0
              ? t(locale, "post.notManifested")
              : plural(locale, "post.interestedCount", post.interestedCount)}
          </p>
          <form action={markInterested.bind(null, post.id)}>
            <button
              type="submit"
              className={`font-mono text-xs uppercase tracking-wide rounded-full border border-orange px-4 py-2 transition-colors whitespace-nowrap ${
                hasVoted
                  ? "bg-orange text-white"
                  : "text-orange hover:bg-orange hover:text-white"
              }`}
            >
              {hasVoted ? "✓ " : ""}
              {t(locale, "post.interestedButton")}
            </button>
          </form>
        </div>

        <div className="mt-3 rounded-lg border border-line px-5 py-4">
          {!post.authorId ? (
            <p className="text-sm text-ink-soft">
              {t(locale, "post.noAccount", { name: post.authorName })}
            </p>
          ) : isOwnPost ? (
            <p className="text-sm text-ink-soft">{t(locale, "post.ownPost")}</p>
          ) : viewer ? (
            <form action={sendMessage} className="flex flex-col gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="recipientId" value={post.authorId} />
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-1">
                {t(locale, "post.writeTo", { name: post.authorName })}
              </p>
              <textarea
                name="content"
                required
                rows={3}
                placeholder={t(locale, "post.messagePlaceholder")}
                className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink resize-y"
              />
              <button
                type="submit"
                className="font-mono text-xs uppercase tracking-wide rounded-full bg-blue text-white px-4 py-2 self-start hover:bg-blue/90 transition-colors"
              >
                {t(locale, "post.send")}
              </button>
            </form>
          ) : (
            <p className="text-sm text-ink-soft">
              <Link href="/connexion" className="text-blue hover:underline">
                {t(locale, "nouveau.connectLink")}
              </Link>{" "}
              {t(locale, "post.loginToWrite", { name: post.authorName })}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
