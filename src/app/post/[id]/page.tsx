import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { addContribution, deletePost, markInterested, sendMessage, voteContribution } from "@/app/actions";
import { timeAgo } from "@/lib/posts";
import { getPostAuthorPoints } from "@/lib/points";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getVoterKey } from "@/lib/interest";
import { t, translateCategory, translateLicense, translateNature } from "@/lib/i18n";
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
      include: {
        categories: true,
        natures: true,
        contributions: { orderBy: { createdAt: "desc" } },
      },
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

  const contributionIds = post.contributions.map((c) => c.id);
  const myContributionVotes = voterKey && contributionIds.length > 0
    ? await prisma.contributionVote.findMany({
        where: { voterKey, contributionId: { in: contributionIds } },
      })
    : [];
  const myVoteByContribution = new Map(myContributionVotes.map((v) => [v.contributionId, v.value]));

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

        <details className="mt-6 group">
          <summary className="cursor-pointer list-none select-none inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink">
            <span className="inline-block leading-none transition-transform group-open:rotate-45">
              +
            </span>
            {t(locale, "post.citeTitle")}
          </summary>
          <div className="mt-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
            <p className="font-mono break-words">
              {post.authorName} ({post.createdAt.getFullYear()}). « {post.title} ». Kangae.{" "}
              {(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000") + `/post/${post.id}`}
            </p>
            {post.license && (
              <p className="mt-2">
                {t(locale, "post.citeLicense")} : {translateLicense(locale, post.license)}
              </p>
            )}
          </div>
        </details>

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

        <div className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-3">
            {t(locale, "contribution.title")}
          </h2>

          {post.contributions.length === 0 && (
            <p className="text-sm text-ink-soft">{t(locale, "contribution.empty")}</p>
          )}

          <div className="flex flex-col gap-3">
            {post.contributions.map((contribution) => {
              const myVote = myVoteByContribution.get(contribution.id);
              const row = (
                <div className="flex items-start gap-3 rounded-lg border border-line px-4 py-3">
                  <div className="flex items-center gap-1 shrink-0">
                    <form action={voteContribution.bind(null, contribution.id, 1)}>
                      <button
                        type="submit"
                        aria-pressed={myVote === 1}
                        aria-label={t(locale, "contribution.voteUpLabel")}
                        className={`p-1 rounded-full transition-colors ${
                          myVote === 1 ? "text-orange" : "text-ink-soft hover:text-orange"
                        }`}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                          <path d="M10 4l6.5 7.5h-4.2V16h-4.6v-4.5H3.5L10 4z" />
                        </svg>
                      </button>
                    </form>
                    <span className="font-mono text-xs w-5 text-center">{contribution.score}</span>
                    <form action={voteContribution.bind(null, contribution.id, -1)}>
                      <button
                        type="submit"
                        aria-pressed={myVote === -1}
                        aria-label={t(locale, "contribution.voteDownLabel")}
                        className={`p-1 rounded-full transition-colors ${
                          myVote === -1 ? "text-ink" : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                          <path d="M10 16l-6.5-7.5h4.2V4h4.6v4.5h3.7L10 16z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-ink-soft">
                      {contribution.authorName}
                      {contribution.authorId && (
                        <span className="text-blue"> {t(locale, "post.verified")}</span>
                      )}{" "}
                      · {timeAgo(contribution.createdAt, locale)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words">{contribution.content}</p>
                  </div>
                </div>
              );

              if (contribution.score <= -3) {
                return (
                  <details key={contribution.id} className="group">
                    <summary className="cursor-pointer list-none font-mono text-xs text-ink-soft hover:text-ink px-4 py-2 rounded-lg border border-line">
                      {t(locale, "contribution.hidden")}
                    </summary>
                    <div className="mt-2">{row}</div>
                  </details>
                );
              }

              return <div key={contribution.id}>{row}</div>;
            })}
          </div>

          <form action={addContribution.bind(null, post.id)} className="mt-4 flex flex-col gap-2">
            <textarea
              name="content"
              required
              rows={3}
              placeholder={t(locale, "contribution.placeholder")}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink resize-y"
            />
            {!viewer && (
              <input
                type="text"
                name="authorName"
                required
                maxLength={60}
                placeholder={t(locale, "nouveau.namePlaceholder")}
                className="rounded-lg border border-line bg-surface px-4 py-2.5 focus:outline-none focus:border-ink"
              />
            )}
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-wide rounded-full border-2 border-orange text-orange px-4 py-2 self-start hover:bg-orange hover:text-white transition-colors"
            >
              {t(locale, "contribution.submit")}
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
