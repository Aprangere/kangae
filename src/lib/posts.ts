import type { Locale } from "@/lib/i18n";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UNIT_LABELS: Record<Locale, [number, string][]> = {
  fr: [
    [60, "s"],
    [60, "min"],
    [24, "h"],
    [30, "j"],
    [12, "mois"],
    [Number.POSITIVE_INFINITY, "an"],
  ],
  en: [
    [60, "s"],
    [60, "min"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ],
};

export function timeAgo(date: Date, locale: Locale = "fr"): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units = UNIT_LABELS[locale];
  let value = seconds;
  let unitLabel = units[0][1];
  for (const [span, label] of units) {
    if (value < span) {
      unitLabel = label;
      break;
    }
    value = Math.floor(value / span);
    unitLabel = label;
  }
  if (unitLabel === units[0][1] && value < 5) {
    return locale === "fr" ? "à l'instant" : "just now";
  }
  return locale === "fr" ? `il y a ${value} ${unitLabel}` : `${value}${unitLabel} ago`;
}
