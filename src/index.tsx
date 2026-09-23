"use client";

import { ConsentBanner, ConsentDialog, ConsentManagerProvider } from "@c15t/nextjs";
import { ConsentDialogLink } from "@c15t/nextjs/components/consent-dialog-link";
import { clarity } from "@c15t/scripts/microsoft-clarity";
import { gtag } from "@c15t/scripts/google-tag";
import { useMemo, type ComponentProps, type ReactNode } from "react";

// @mediastar/consent — the cookie banner of every Mediastar Next.js site, on c15t.
//
// One component in the root layout does all of it: the banner, the preferences dialog, GA4 and
// Microsoft Clarity loaded only after consent, and every choice sent to the central register
// (consent-service) when `backendURL` is given. See README.md for the per-site checklist.
//
// THE RULES IT FOLLOWS (Garante, linee guida cookie 2021 and FAQ):
//   - opt-in for everyone: nothing but "necessary" before a choice;
//   - "Rifiuta tutto" beside "Accetta tutto", same weight;
//   - the choice kept 180 days, then the banner asks again;
//   - the choice changeable at any time (<PreferenzeCookie /> in the footer).
// With `backendURL` the central service decides the policy (the same rules); without it, the
// offline policy below applies and the choice stays in the browser only.
//
// GA4 IS LOADED IN CONSENT MODE "BASIC": gtag.js is not requested until "Statistica" is accepted.
// c15t's helper defaults to "advanced" (script always loaded, cookieless pings before any choice),
// which sends data to Google before the visitor has said anything.

export type Category = "measurement" | "marketing";

/** Colour tokens, as c15t names them. Anything left out keeps the default below. */
export type ConsentColors = Partial<{
  primary: string;
  primaryHover: string;
  textOnPrimary: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderHover: string;
  text: string;
  textMuted: string;
  overlay: string;
  switchTrack: string;
  switchTrackActive: string;
  switchThumb: string;
}>;

type Scripts = NonNullable<ComponentProps<typeof ConsentManagerProvider>["options"]["scripts"]>;

export type ConsentManagerProps = {
  children: ReactNode;
  /** The central register, e.g. https://consent.mediastarweb.it/api/c15t. Empty: browser only. */
  backendURL?: string;
  /** GA4 measurement ID (G-…). Empty: no GA4. */
  ga4Id?: string;
  /** Microsoft Clarity project ID. Empty: no Clarity. */
  clarityId?: string;
  /** Other consent-gated scripts (c15t Script objects, e.g. from @c15t/scripts/meta-pixel). */
  scripts?: Scripts;
  /** Categories offered besides "necessary". Default: "measurement" only. Add "marketing" on a
   *  site that advertises (and gate its pixels with `scripts`). */
  categories?: Category[];
  /** Palette. Default: light neutrals with the Mediastar orange. */
  colors?: ConsentColors;
  /** "light", "dark" or "system". Default "light". */
  colorScheme?: "light" | "dark" | "system";
  /** Font for the banner and dialog. Default: the page's own (inherit). */
  fontFamily?: string;
  /** Where the privacy policy lives. Default "/privacy". */
  privacyPolicyHref?: string;
  /** Where the cookie policy lives. Omitted: no cookie policy link. */
  cookiePolicyHref?: string;
  /** Italian copy overrides, deep-merged over the defaults (same shape as `DEFAULT_MESSAGES`). */
  messages?: DeepPartial<typeof DEFAULT_MESSAGES>;
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** A stable default: a fresh `[]` on every render would recompute the scripts on every render. */
const NO_SCRIPTS: Scripts = [];

/** Days before the banner asks again: the Garante wants at least six months. */
export const EXPIRY_DAYS = 180;

const DEFAULT_COLORS: Required<ConsentColors> = {
  primary: "#fa6400",
  primaryHover: "#ff7a1f",
  textOnPrimary: "#080708",
  surface: "#ffffff",
  surfaceHover: "#f4f6f7",
  border: "rgba(8, 7, 8, 0.12)",
  borderHover: "rgba(8, 7, 8, 0.22)",
  text: "#161a1d",
  textMuted: "#5d6a73",
  overlay: "rgba(8, 7, 8, 0.5)",
  switchTrack: "#c1ccd3",
  switchTrackActive: "#fa6400",
  switchThumb: "#ffffff",
};

// Every label the UI shows. c15t bundles only English on the client, and its Italian (served by the
// backend) mentions personalised content these sites do not have.
export const DEFAULT_MESSAGES = {
  common: {
    acceptAll: "Accetta tutto",
    rejectAll: "Rifiuta tutto",
    customize: "Personalizza",
    save: "Salva le scelte",
    close: "Chiudi",
  },
  cookieBanner: {
    title: "Cookie",
    description: "",
  },
  consentManagerDialog: {
    title: "Preferenze cookie",
    description:
      "Scegli quali strumenti autorizzare. I cookie tecnici servono al funzionamento del sito e non si possono disattivare.",
  },
  consentTypes: {
    necessary: {
      title: "Tecnici",
      description:
        "Servono al funzionamento del sito e a ricordare la tua scelta sui cookie. Non raccolgono dati per altri scopi.",
    },
    measurement: {
      title: "Statistica",
      description: "",
    },
    marketing: {
      title: "Marketing",
      description:
        "Strumenti pubblicitari che misurano l'efficacia degli annunci e ti mostrano contenuti pertinenti su altri siti.",
    },
  },
  legalLinks: {
    privacyPolicy: "Privacy policy",
    cookiePolicy: "Cookie policy",
  },
};

/** "A", "A e B", "A, B e C". */
function list(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

/** The banner and "Statistica" texts name the tools actually loaded, so they are never untrue. */
function defaultMessages(tools: string[], categories: Category[]) {
  const stats = tools.length > 0 ? ` (${list(tools)})` : "";
  const purposes = [
    categories.includes("measurement") ? `strumenti di statistica${stats} per capire come viene usato il sito e migliorarlo` : null,
    categories.includes("marketing") ? "strumenti di marketing per misurare gli annunci" : null,
  ].filter((p): p is string => p !== null);
  const messages = structuredClone(DEFAULT_MESSAGES);
  messages.cookieBanner.title = categories.length > 0 ? "Cookie e statistiche" : "Cookie";
  messages.cookieBanner.description =
    `Usiamo cookie tecnici, necessari al funzionamento del sito` +
    (purposes.length > 0 ? `, e — solo se lo accetti — ${list(purposes)}.` : ".") +
    " Puoi cambiare idea in qualsiasi momento da «Preferenze cookie» in fondo alla pagina.";
  messages.consentTypes.measurement.description =
    tools.length > 0
      ? `${list(tools)}: pagine visitate, percorsi e interazioni, per capire cosa funziona e cosa no.` +
        (tools.includes("Microsoft Clarity")
          ? " Clarity può registrare in forma anonima come la pagina viene usata (movimenti, clic, scorrimento)."
          : "")
      : "Strumenti che misurano in forma aggregata come viene usato il sito.";
  return messages;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) out[key] = merge((base as Record<string, unknown>)[key], value);
  }
  return out as T;
}

export function ConsentManager({
  children,
  backendURL,
  ga4Id,
  clarityId,
  scripts: extraScripts = NO_SCRIPTS,
  categories = ["measurement"],
  colors,
  colorScheme = "light",
  fontFamily = "inherit",
  privacyPolicyHref = "/privacy",
  cookiePolicyHref,
  messages,
}: ConsentManagerProps) {
  const scripts = useMemo(
    () => [
      ...(ga4Id ? [gtag({ id: ga4Id, category: "measurement", script: { alwaysLoad: false } })] : []),
      ...(clarityId ? [clarity({ id: clarityId })] : []),
      ...extraScripts,
    ],
    [ga4Id, clarityId, extraScripts],
  );

  const tools = [ga4Id ? "Google Analytics" : null, clarityId ? "Microsoft Clarity" : null].filter(
    (tool): tool is string => tool !== null,
  );
  const consentCategories: ("necessary" | Category)[] = ["necessary", ...categories];
  const it = merge(defaultMessages(tools, categories), messages);
  const palette = { ...DEFAULT_COLORS, ...colors };

  return (
    <ConsentManagerProvider
      options={{
        ...(backendURL ? { mode: "hosted" as const, backendURL } : { mode: "offline" as const }),
        consentCategories,
        scripts,
        colorScheme,
        theme: {
          // Same palette in both: with a dark scheme c15t reads `dark`, and falls back to its own
          // indigo, not to `colors`, for anything missing there.
          colors: palette,
          dark: palette,
          typography: { fontFamily },
          consentActions: {
            reject: { variant: "primary", mode: "filled" },
            accept: { variant: "primary", mode: "filled" },
            customize: { variant: "neutral", mode: "ghost" },
          },
        },
        i18n: { locale: "it", detectBrowserLanguage: false, messages: { it } },
        legalLinks: {
          privacyPolicy: { href: privacyPolicyHref, target: "_self" },
          ...(cookiePolicyHref ? { cookiePolicy: { href: cookiePolicyHref, target: "_self" } } : {}),
        },
        // Used without a backend, or while it is unreachable.
        offlinePolicy: {
          policyPacks: [
            {
              id: "opt-in",
              match: { isDefault: true, fallback: true },
              consent: { model: "opt-in", categories: consentCategories, expiryDays: EXPIRY_DAYS },
              ui: {
                mode: "banner",
                banner: {
                  allowedActions: ["reject", "accept", "customize"],
                  primaryActions: ["reject", "accept"],
                  layout: [["reject", "accept"], "customize"],
                },
              },
            },
          ],
        },
      }}
    >
      <ConsentBanner hideBranding />
      <ConsentDialog hideBranding />
      {children}
    </ConsentManagerProvider>
  );
}

/** The footer link that reopens the preferences dialog. A <button>; style it with `className`. */
export function PreferenzeCookie({
  children = "Preferenze cookie",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <ConsentDialogLink className={className}>{children}</ConsentDialogLink>;
}

/** Sends a GA4 event. Does nothing until the visitor has accepted "Statistica" and GA4 has loaded —
 *  so components can call it unconditionally, and consent stays one decision made in one place. */
export function gtagEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
