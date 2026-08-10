import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { deletePost, markInterested, sendMessage } from "@/app/actions";
import { timeAgo } from "@/lib/posts";
import { getPostAuthorPoints } from "@/lib/points";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getVoterKey } from "@/lib/interest";
import { t, translateCategory, translateNature } from "@/lib/i18n";
import { DeleteButton } from "@/components/DeleteButton";

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
  const canDelete = isOwnPost || Boolean(viewer?.isAdmin);
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

        <div className="mt-8 flex items-center justify-between gap-4">
          {viewer ? (
            <form action={markInterested.bind(null, post.id)}>
              <button
                type="submit"
                aria-pressed={hasVoted}
                aria-label={t(locale, "post.upvoteLabel")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-mono text-xs transition-colors ${
                  hasVoted
                    ? "border-orange bg-orange text-white"
                    : "border-line text-ink-soft hover:border-orange hover:text-orange"
                }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path d="M10 4l6.5 7.5h-4.2V16h-4.6v-4.5H3.5L10 4z" />
                </svg>
                {post.interestedCount}
              </button>
            </form>
          ) : (
            <Link
              href="/connexion"
              aria-label={t(locale, "post.upvoteLoginHint")}
              title={t(locale, "post.upvoteLoginHint")}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 font-mono text-xs text-ink-soft hover:border-orange hover:text-orange transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path d="M10 4l6.5 7.5h-4.2V16h-4.6v-4.5H3.5L10 4z" />
              </svg>
              {post.interestedCount}
            </Link>
          )}

          {canDelete && (
            <form action={deletePost.bind(null, post.id)}>
              <DeleteButton
                label={t(locale, "post.delete")}
                confirmText={t(locale, "post.deleteConfirm")}
              />
            </form>
          )}
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
