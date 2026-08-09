"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function toggle() {
    const next: Locale = locale === "fr" ? "en" : "fr";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const targetFlag = locale === "fr" ? "/flags/gb.svg" : "/flags/fr.svg";
  const targetLabel = locale === "fr" ? "EN" : "FR";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch language"
      className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-ink-soft hover:border-ink hover:text-ink transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={targetFlag} alt={targetLabel} className="w-4 h-auto rounded-sm" />
      <span className="font-mono text-xs">{targetLabel}</span>
    </button>
  );
}
