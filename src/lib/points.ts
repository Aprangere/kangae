import { prisma } from "@/lib/prisma";

const POINTS_PER_POST = 5;

export function pointsKey(post: { authorId: string | null; authorName: string }): string {
  return post.authorId ? `id:${post.authorId}` : `name:${post.authorName}`;
}

export async function getPointsMap(): Promise<Map<string, number>> {
  const [byAccount, byName] = await Promise.all([
    prisma.post.groupBy({
      by: ["authorId"],
      where: { authorId: { not: null } },
      _count: { _all: true },
      _sum: { interestedCount: true },
    }),
    prisma.post.groupBy({
      by: ["authorName"],
      where: { authorId: null },
      _count: { _all: true },
      _sum: { interestedCount: true },
    }),
  ]);

  const map = new Map<string, number>();
  for (const g of byAccount) {
    if (g.authorId) {
      map.set(`id:${g.authorId}`, g._count._all * POINTS_PER_POST + (g._sum.interestedCount ?? 0));
    }
  }
  for (const g of byName) {
    map.set(`name:${g.authorName}`, g._count._all * POINTS_PER_POST + (g._sum.interestedCount ?? 0));
  }
  return map;
}

export async function getPostAuthorPoints(post: { authorId: string | null; authorName: string }): Promise<number> {
  const where = post.authorId ? { authorId: post.authorId } : { authorName: post.authorName, authorId: null };
  const agg = await prisma.post.aggregate({
    where,
    _count: { _all: true },
    _sum: { interestedCount: true },
  });
  return (agg._count._all ?? 0) * POINTS_PER_POST + (agg._sum.interestedCount ?? 0);
}
