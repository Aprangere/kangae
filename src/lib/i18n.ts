export type Locale = "fr" | "en";

export const LOCALE_COOKIE = "kangae_locale";
export const DEFAULT_LOCALE: Locale = "fr";

const strings: Record<Locale, Record<string, string>> = {
  fr: {
    "header.publish": "Publier",
    "header.messages": "Messages",
    "header.logout": "Déconnexion",
    "header.login": "Se connecter",

    "home.title": "Relier ceux qui pensent à ceux qui font.",
    "home.subtitle":
      "Ce qui peut changer des vies tient parfois en quatre phrases — trouvez l'idée qui vous manquait, ou partagez la vôtre.",
    "home.cta.find": "Trouver une idée",
    "home.cta.share": "Partager une idée",
    "home.story.eyebrow": "Pourquoi Kangae",
    "home.story.body":
      "J'ai toujours eu plein d'idées, mais pas toujours le temps ou l'expertise pour les mener à terme. En 2026, j'ai découvert que d'autres avaient exactement le problème inverse : de l'énergie et du temps qui n'attendaient qu'une direction.",
    "home.latest": "Dernières publications",
    "home.seeAll": "Voir tout →",

    "explorer.title": "Explorer",
    "explorer.empty": "Rien ne correspond à ces filtres pour l'instant.",

    "sidebar.search": "Chercher",
    "sidebar.searchPlaceholder": "Une idée, une question...",
    "sidebar.nature": "Nature du post",
    "sidebar.multi": "Plusieurs choix possibles",
    "sidebar.categories": "Catégories",

    "postcard.pts": "pts",
    "postcard.interestedSuffix_one": "{count} vote",
    "postcard.interestedSuffix_other": "{count} votes",

    "nouveau.title": "Publier",
    "nouveau.connected":
      "Connecté comme {email} — vérifié, et les gens pourront vous écrire directement.",
    "nouveau.notConnected":
      "Pas connecté — votre post reste public mais personne ne pourra vous écrire.",
    "nouveau.connectLink": "Connectez-vous",
    "nouveau.connectSuffix": "pour être joignable.",
    "nouveau.nature": "Nature du post",
    "nouveau.titlePlaceholder": "En une phrase, de quoi s'agit-il ?",
    "nouveau.contentPlaceholder": "Quatre phrases suffisent.",
    "nouveau.categories": "Catégories",
    "nouveau.newCategoriesPlaceholder": "Ajouter d'autres catégories (séparées par des virgules)",
    "nouveau.newCategoriesHint": "Pas dans la liste ? Tapez-en une nouvelle, elle sera créée.",
    "nouveau.namePlaceholder": "Comment on vous appelle",
    "nouveau.submit": "Publier",
    "nouveau.addTags": "Ajouter nature / catégories",
    "nouveau.mediaSoon": "Médias — bientôt disponible",

    "partage.title": "Idée partagée !",
    "partage.subtitle": "« {title} » est maintenant visible par tout le monde.",
    "partage.viewCta": "Voir mon idée",
    "partage.anotherCta": "Partager une autre idée",

    "post.upvoteLabel": "Upvoter cette idée",
    "post.upvoteLoginHint": "Se connecter pour upvoter",
    "post.verified": "✓ vérifié",
    "post.noAccount":
      "{name} n'a pas de compte vérifié — cette idée est publique et libre, n'importe qui peut s'en emparer.",
    "post.ownPost": "C'est votre post.",
    "post.writeTo": "Écrire à {name}",
    "post.messagePlaceholder": "Votre message...",
    "post.send": "Envoyer",
    "post.loginToWrite": "pour écrire à {name}.",

    "connexion.title": "Se connecter",
    "connexion.subtitle":
      "Optionnel : un compte vérifie que vos posts sont bien de vous, et protège vos points. Pas de mot de passe — juste un lien par email.",
    "connexion.sent": "Lien envoyé — vérifiez votre boîte mail (valable 15 minutes).",
    "connexion.error": "Ce lien n'est plus valide. Redemandez-en un ci-dessous.",
    "connexion.email": "Email",
    "connexion.emailPlaceholder": "vous@exemple.com",
    "connexion.submit": "Recevoir le lien",

    "messages.title": "Messages",
    "messages.empty": "Pas encore de message.",
    "messages.with": "avec",
    "messages.replyPlaceholder": "Répondre...",
    "messages.send": "Envoyer",
  },
  en: {
    "header.publish": "Post",
    "header.messages": "Messages",
    "header.logout": "Log out",
    "header.login": "Log in",

    "home.title": "Connecting those who think to those who do.",
    "home.subtitle":
      "What can change lives sometimes fits in four sentences — find the idea you were missing, or share yours.",
    "home.cta.find": "Find an idea",
    "home.cta.share": "Share an idea",
    "home.story.eyebrow": "Why Kangae",
    "home.story.body":
      "I've always had plenty of ideas, but not always the time or expertise to see them through. In 2026, I found out other people had exactly the opposite problem: energy and time just waiting for a direction.",
    "home.latest": "Latest posts",
    "home.seeAll": "See all →",

    "explorer.title": "Explore",
    "explorer.empty": "Nothing matches these filters yet.",

    "sidebar.search": "Search",
    "sidebar.searchPlaceholder": "An idea, a question...",
    "sidebar.nature": "Post type",
    "sidebar.multi": "Multiple choices allowed",
    "sidebar.categories": "Categories",

    "postcard.pts": "pts",
    "postcard.interestedSuffix_one": "{count} vote",
    "postcard.interestedSuffix_other": "{count} votes",

    "nouveau.title": "Post",
    "nouveau.connected":
      "Signed in as {email} — verified, and people will be able to write to you directly.",
    "nouveau.notConnected":
      "Not signed in — your post stays public but no one will be able to write to you.",
    "nouveau.connectLink": "Sign in",
    "nouveau.connectSuffix": "to be reachable.",
    "nouveau.nature": "Post type",
    "nouveau.titlePlaceholder": "In one sentence, what is it about?",
    "nouveau.contentPlaceholder": "Four sentences are enough.",
    "nouveau.categories": "Categories",
    "nouveau.newCategoriesPlaceholder": "Add other categories (comma-separated)",
    "nouveau.newCategoriesHint": "Not in the list? Type a new one, it'll be created.",
    "nouveau.namePlaceholder": "What should we call you",
    "nouveau.submit": "Post",
    "nouveau.addTags": "Add type / categories",
    "nouveau.mediaSoon": "Media — coming soon",

    "partage.title": "Idea shared!",
    "partage.subtitle": "\"{title}\" is now visible to everyone.",
    "partage.viewCta": "View my idea",
    "partage.anotherCta": "Share another idea",

    "post.upvoteLabel": "Upvote this idea",
    "post.upvoteLoginHint": "Sign in to upvote",
    "post.verified": "✓ verified",
    "post.noAccount":
      "{name} doesn't have a verified account — this idea is public and free, anyone can pick it up.",
    "post.ownPost": "This is your post.",
    "post.writeTo": "Write to {name}",
    "post.messagePlaceholder": "Your message...",
    "post.send": "Send",
    "post.loginToWrite": "to write to {name}.",

    "connexion.title": "Log in",
    "connexion.subtitle":
      "Optional: an account verifies your posts are really yours, and protects your points. No password — just a link by email.",
    "connexion.sent": "Link sent — check your inbox (valid for 15 minutes).",
    "connexion.error": "This link is no longer valid. Request a new one below.",
    "connexion.email": "Email",
    "connexion.emailPlaceholder": "you@example.com",
    "connexion.submit": "Get the link",

    "messages.title": "Messages",
    "messages.empty": "No messages yet.",
    "messages.with": "with",
    "messages.replyPlaceholder": "Reply...",
    "messages.send": "Send",
  },
};

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let str = strings[locale]?.[key] ?? strings.fr[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function plural(
  locale: Locale,
  key: string,
  count: number,
  vars?: Record<string, string | number>
): string {
  const suffix = count === 1 ? "_one" : "_other";
  return t(locale, `${key}${suffix}`, { count, ...vars });
}

const CATEGORY_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  tech: { fr: "Tech", en: "Tech" },
  environnement: { fr: "Environnement", en: "Environment" },
  ia: { fr: "IA", en: "AI" },
  administration: { fr: "Administration", en: "Administration" },
  management: { fr: "Management", en: "Management" },
};

const NATURE_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  "idee-startup": { fr: "Idée de startup", en: "Startup idea" },
  "le-monde-en-a-besoin": { fr: "Le monde en a besoin", en: "The world needs this" },
  "question-recherche": { fr: "Question de recherche", en: "Research question" },
};

export function translateCategory(locale: Locale, slug: string, fallback: string): string {
  return CATEGORY_TRANSLATIONS[slug]?.[locale] ?? fallback;
}

export function translateNature(locale: Locale, slug: string, fallback: string): string {
  return NATURE_TRANSLATIONS[slug]?.[locale] ?? fallback;
}
