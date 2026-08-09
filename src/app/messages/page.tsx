import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendMessage } from "@/app/actions";
import { timeAgo } from "@/lib/posts";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function MessagesPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!user) redirect("/connexion");

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
    include: { post: true, sender: true, recipient: true },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  type ThreadMessage = (typeof messages)[number];
  type Thread = {
    postId: string;
    postTitle: string;
    otherUserId: string;
    otherEmail: string;
    messages: ThreadMessage[];
  };

  const threads = new Map<string, Thread>();
  for (const m of messages) {
    const other = m.senderId === user.id ? m.recipient : m.sender;
    const key = `${m.postId}:${other.id}`;
    if (!threads.has(key)) {
      threads.set(key, {
        postId: m.postId,
        postTitle: m.post.title,
        otherUserId: other.id,
        otherEmail: other.email,
        messages: [],
      });
    }
    threads.get(key)!.messages.push(m);
  }

  const threadList = Array.from(threads.values()).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1].createdAt;
    const bLast = b.messages[b.messages.length - 1].createdAt;
    return bLast.getTime() - aLast.getTime();
  });

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight mb-8">
          {t(locale, "messages.title")}
        </h1>

        {threadList.length === 0 ? (
          <p className="font-mono text-sm text-ink-soft rounded-xl border border-dashed border-line px-5 py-8 text-center">
            {t(locale, "messages.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {threadList.map((thread) => (
              <div key={`${thread.postId}:${thread.otherUserId}`} className="rounded-xl border border-line p-5">
                <p className="font-mono text-xs uppercase tracking-wide text-ink-soft mb-3">
                  {thread.postTitle} · {t(locale, "messages.with")} {thread.otherEmail}
                </p>
                <div className="flex flex-col gap-3 mb-4">
                  {thread.messages.map((m) => (
                    <div key={m.id} className={m.senderId === user.id ? "text-right" : ""}>
                      <p className="text-sm">{m.content}</p>
                      <p className="text-xs text-ink-soft mt-0.5">{timeAgo(m.createdAt, locale)}</p>
                    </div>
                  ))}
                </div>
                <form action={sendMessage} className="flex gap-2">
                  <input type="hidden" name="postId" value={thread.postId} />
                  <input type="hidden" name="recipientId" value={thread.otherUserId} />
                  <input
                    type="text"
                    name="content"
                    required
                    placeholder={t(locale, "messages.replyPlaceholder")}
                    className="flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                  <button
                    type="submit"
                    className="font-mono text-xs uppercase tracking-wide rounded-full bg-ink text-paper px-4 py-2 hover:bg-ink/90 transition-colors"
                  >
                    {t(locale, "messages.send")}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
