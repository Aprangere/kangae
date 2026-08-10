"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/auth";
import { sendMagicLink } from "@/lib/mail";
import { EMAIL_PATTERN } from "@/lib/posts";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import { getVoterKey } from "@/lib/interest";
import { LICENSE_OPTIONS } from "@/lib/i18n";

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale === "en" ? "en" : "fr", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function createPost(formData: FormData) {
  const currentUser = await getCurrentUser();
  const title = formData.get("title");
  const content = formData.get("content");
  const authorNameRaw = formData.get("authorName");
  const categorySlugs = formData.getAll("categories").map(String);
  const natureSlugs = formData.getAll("natures").map(String);
  const newCategoriesRaw = formData.get("newCategories");
  const licenseRaw = formData.get("license");
  const license =
    typeof licenseRaw === "string" && LICENSE_OPTIONS.includes(licenseRaw as (typeof LICENSE_OPTIONS)[number])
      ? licenseRaw
      : null;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Le titre est requis.");
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Le contenu est requis.");
  }
  const authorName =
    typeof authorNameRaw === "string" && authorNameRaw.trim().length > 0
      ? authorNameRaw.trim()
      : currentUser?.name ?? currentUser?.email;
  if (!authorName) {
    throw new Error("Le nom est requis.");
  }

  const newCategoryNames = typeof newCategoriesRaw === "string"
    ? newCategoriesRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorName,
      authorId: currentUser?.id,
      license,
      categories: {
        connect: categorySlugs.map((slug) => ({ slug })),
        connectOrCreate: newCategoryNames.map((name) => ({
          where: { slug: slugify(name) },
          create: { name, slug: slugify(name) },
        })),
      },
      natures: { connect: natureSlugs.map((slug) => ({ slug })) },
    },
  });

  revalidatePath("/");
  redirect(`/nouveau/publie?id=${post.id}`);
}

export async function deletePost(postId: string) {
  const currentUser = await getCurrentUser();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) redirect("/");

  const canDelete = currentUser?.isAdmin || currentUser?.id === post.authorId;
  if (!canDelete) {
    throw new Error("Vous n'avez pas le droit de supprimer ce post.");
  }

  await prisma.$transaction([
    prisma.interest.deleteMany({ where: { postId } }),
    prisma.message.deleteMany({ where: { postId } }),
    prisma.contributionVote.deleteMany({ where: { contribution: { postId } } }),
    prisma.contribution.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  revalidatePath("/");
  revalidatePath("/explorer");
  redirect("/");
}

export async function markInterested(postId: string) {
  const voterKey = await getVoterKey();
  if (!voterKey) redirect("/connexion");

  const existing = await prisma.interest.findUnique({
    where: { postId_voterKey: { postId, voterKey } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.interest.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { interestedCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.interest.create({ data: { postId, voterKey } }),
      prisma.post.update({
        where: { id: postId },
        data: { interestedCount: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
}

export async function addContribution(postId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  const content = formData.get("content");
  const authorNameRaw = formData.get("authorName");

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Le contenu est requis.");
  }
  const authorName =
    typeof authorNameRaw === "string" && authorNameRaw.trim().length > 0
      ? authorNameRaw.trim()
      : currentUser?.name ?? currentUser?.email;
  if (!authorName) {
    throw new Error("Le nom est requis.");
  }

  await prisma.contribution.create({
    data: {
      postId,
      content: content.trim(),
      authorName,
      authorId: currentUser?.id,
    },
  });

  revalidatePath(`/post/${postId}`);
}

export async function voteContribution(contributionId: string, value: 1 | -1) {
  const voterKey = await getVoterKey();
  if (!voterKey) redirect("/connexion");

  const contribution = await prisma.contribution.findUnique({ where: { id: contributionId } });
  if (!contribution) redirect("/");

  const existing = await prisma.contributionVote.findUnique({
    where: { contributionId_voterKey: { contributionId, voterKey } },
  });

  if (existing && existing.value === value) {
    await prisma.$transaction([
      prisma.contributionVote.delete({ where: { id: existing.id } }),
      prisma.contribution.update({
        where: { id: contributionId },
        data: { score: { decrement: value } },
      }),
    ]);
  } else if (existing) {
    await prisma.$transaction([
      prisma.contributionVote.update({ where: { id: existing.id }, data: { value } }),
      prisma.contribution.update({
        where: { id: contributionId },
        data: { score: { increment: value * 2 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.contributionVote.create({ data: { contributionId, voterKey, value } }),
      prisma.contribution.update({
        where: { id: contributionId },
        data: { score: { increment: value } },
      }),
    ]);
  }

  revalidatePath(`/post/${contribution.postId}`);
}

export async function requestMagicLink(formData: FormData) {
  const emailRaw = formData.get("email");
  if (typeof emailRaw !== "string" || !EMAIL_PATTERN.test(emailRaw)) {
    throw new Error("Email invalide.");
  }
  const email = emailRaw.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.loginToken.create({
    data: {
      token,
      email: user.email,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  await sendMagicLink(user.email, `${baseUrl}/verifier?token=${token}`);

  redirect("/connexion?envoye=1");
}

export async function sendMessage(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/connexion");

  const postId = formData.get("postId");
  const recipientId = formData.get("recipientId");
  const content = formData.get("content");

  if (typeof postId !== "string" || typeof recipientId !== "string") {
    throw new Error("Message invalide.");
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Le message ne peut pas être vide.");
  }
  if (recipientId === currentUser.id) {
    throw new Error("Vous ne pouvez pas vous envoyer un message.");
  }

  await prisma.message.create({
    data: {
      postId,
      senderId: currentUser.id,
      recipientId,
      content: content.trim(),
    },
  });

  revalidatePath("/messages");
  redirect("/messages");
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/");
  redirect("/");
}
