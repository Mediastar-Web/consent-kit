"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ConsentBanner, ConsentDialog, ConsentManagerProvider, useConsentManager, useTranslations, } from "@c15t/nextjs";
import { ConsentDialogLink } from "@c15t/nextjs/components/consent-dialog-link";
import { gtag } from "@c15t/scripts/google-tag";
import { linkedinInsights } from "@c15t/scripts/linkedin-insights";
import { metaPixel } from "@c15t/scripts/meta-pixel";
import { clarity } from "@c15t/scripts/microsoft-clarity";
import { tiktokPixel } from "@c15t/scripts/tiktok-pixel";
import { createContext, useContext, useMemo } from "react";
import { EMBEDS, TRACKERS, activeTrackers, listOf, } from "./vendors.js";
export { EMBEDS, TRACKERS } from "./vendors.js";
/** Stable defaults: a fresh `[]` on every render would recompute the scripts on every render. */
const NO_SCRIPTS = [];
const NO_EMBEDS = [];
/** Days before the banner asks again. The Garante wants at least six months, and six calendar
 *  months are 181 to 184 days: 180 would ask one day early. */
export const EXPIRY_DAYS = 185;
/** Every category a site may use. The policy keeps all of them in scope; each site shows only
 *  the ones its tools need. */
const ALL_CATEGORIES = ["necessary", "measurement", "marketing", "experience"];
const DEFAULT_COLORS = {
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
/** How each tool is loaded, once its category is granted. */
const SCRIPTS = {
    ga4: (id) => gtag({ id, category: "measurement", script: { alwaysLoad: false } }),
    // Its own script id: two Google tags under c15t's default id ("gtag") would replace each other.
    googleAds: (id) => gtag({ id, category: "marketing", script: { id: "google-ads", alwaysLoad: false } }),
    clarity: (id) => clarity({ id }),
    metaPixel: (id) => metaPixel({ pixelId: id }),
    tiktokPixel: (id) => tiktokPixel({ pixelId: id }),
    linkedin: (id) => linkedinInsights({ id }),
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
        title: "Cookie e privacy",
        description: "",
    },
    consentManagerDialog: {
        title: "Preferenze cookie",
        description: "Scegli quali strumenti autorizzare. I cookie tecnici servono al funzionamento del sito e non si possono disattivare. Fornitori, cookie e durate sono descritti nella cookie policy.",
    },
    consentTypes: {
        necessary: {
            title: "Tecnici",
            description: "Servono al funzionamento del sito e a ricordare la tua scelta sui cookie. Non raccolgono dati per altri scopi.",
        },
        measurement: {
            title: "Statistica",
            description: "Strumenti che misurano come viene usato il sito.",
        },
        marketing: {
            title: "Marketing e profilazione",
            description: "Strumenti che misurano l'efficacia degli annunci e ti mostrano pubblicità in linea con i tuoi interessi, anche su altri siti.",
        },
        experience: {
            title: "Contenuti esterni",
            description: "Mappe e video di altri servizi incorporati nelle pagine. Si caricano solo con il tuo consenso, e chi li fornisce riceve i tuoi dati di navigazione.",
        },
    },
    legalLinks: {
        privacyPolicy: "Privacy policy",
        cookiePolicy: "Cookie policy",
    },
};
/** The names of the tools in one category, trackers first. */
function namesIn(category, trackerIds, embeds) {
    return [
        ...trackerIds.filter((id) => TRACKERS[id].category === category).map((id) => TRACKERS[id].name),
        ...embeds.filter((id) => EMBEDS[id].category === category).map((id) => EMBEDS[id].name),
    ];
}
/** What the embeds bring into the pages, in Italian: "mappe", "video" or both. */
function embedKinds(embeds) {
    const maps = embeds.includes("googleMaps");
    const videos = embeds.some((id) => id !== "googleMaps");
    return maps && videos ? "mappe e video" : maps ? "mappe" : "video";
}
/** The texts name the tools actually loaded, so they are never untrue. */
function defaultMessages(trackerIds, embeds, categories) {
    const measurement = namesIn("measurement", trackerIds, embeds);
    const marketing = namesIn("marketing", trackerIds, embeds);
    const experience = namesIn("experience", trackerIds, embeds);
    const tools = (names) => (names.length > 0 ? ` (${listOf(names)})` : "");
    const kinds = embedKinds(embeds);
    const purposes = [
        categories.includes("measurement") ? `strumenti di statistica${tools(measurement)}` : null,
        categories.includes("marketing") ? `strumenti di marketing e profilazione${tools(marketing)}` : null,
        categories.includes("experience") ? `${kinds} di altri servizi${tools(experience)}` : null,
    ].filter((purpose) => purpose !== null);
    const messages = structuredClone(DEFAULT_MESSAGES);
    messages.cookieBanner.description =
        "Usiamo cookie tecnici, necessari al funzionamento del sito." +
            (purposes.length > 0 ? ` Solo con il tuo consenso usiamo anche ${listOf(purposes)}.` : "") +
            " Con la X o con «Rifiuta tutto» restano solo quelli tecnici; puoi cambiare idea quando vuoi da «Preferenze cookie», in fondo alla pagina.";
    if (measurement.length > 0) {
        messages.consentTypes.measurement.description =
            `${listOf(measurement)}: pagine visitate, provenienza e interazioni, per capire come viene usato il sito.` +
                (trackerIds.includes("clarity")
                    ? " Clarity registra in forma anonima come vengono usate le pagine (movimenti, clic, scorrimento)."
                    : "");
    }
    if (marketing.length > 0) {
        const one = marketing.length === 1;
        messages.consentTypes.marketing.description = `${listOf(marketing)}: ${one ? "misura" : "misurano"} l'efficacia degli annunci e ti ${one ? "mostra" : "mostrano"} pubblicità in linea con i tuoi interessi, anche su altri siti.`;
    }
    if (experience.length > 0) {
        messages.consentTypes.experience.description = `${listOf(experience)}: ${kinds} ${kinds === "mappe" ? "incorporate" : "incorporati"} nelle pagine. Si caricano solo con il tuo consenso, e chi li fornisce riceve i tuoi dati di navigazione.`;
    }
    return messages;
}
/** The links the banner and the dialog show. c15t 2.2 shows none unless they are named, whatever
 *  its docs say about the default; a link whose href is not configured is left out. */
const LEGAL_LINKS = ["privacyPolicy", "cookiePolicy"];
/** A short, stable fingerprint of the tools in use (FNV-1a), for the storage key. */
function fingerprint(parts) {
    let hash = 0x811c9dc5;
    for (const char of [...parts].sort().join(",")) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function merge(base, override) {
    if (!isObject(base) || !isObject(override))
        return (override ?? base);
    const out = { ...base };
    for (const [key, value] of Object.entries(override)) {
        if (value !== undefined)
            out[key] = merge(base[key], value);
    }
    return out;
}
export function ConsentManager({ children, backendURL, ssrData, trackers, embeds = NO_EMBEDS, scripts: extraScripts = NO_SCRIPTS, colors, radius, colorScheme = "light", fontFamily = "inherit", privacyPolicyHref = "/privacy", cookiePolicyHref, messages, storageKey = "c15t", }) {
    const trackerIds = activeTrackers(trackers);
    const scripts = useMemo(() => [
        ...activeTrackers(trackers).map((id) => SCRIPTS[id](trackers?.[id]?.trim() ?? "")),
        ...extraScripts,
    ], [trackers, extraScripts]);
    // The categories come from the tools: a site without advertising never shows "Marketing".
    const inUse = new Set([
        ...trackerIds.map((id) => TRACKERS[id].category),
        ...embeds.map((id) => EMBEDS[id].category),
        ...extraScripts.flatMap((script) => (typeof script.category === "string" ? [script.category] : [])),
    ]);
    const categories = ["measurement", "marketing", "experience"].filter((category) => inUse.has(category));
    const asksUpfront = categories.includes("measurement") || categories.includes("marketing");
    const it = merge(defaultMessages(trackerIds, embeds, categories), messages);
    const palette = { ...DEFAULT_COLORS, ...colors };
    const version = fingerprint([...trackerIds, ...embeds, ...extraScripts.map((script) => script.id)]);
    return (_jsxs(ConsentManagerProvider, { options: {
            ...(backendURL ? { mode: "hosted", backendURL } : { mode: "offline" }),
            ...(ssrData ? { ssrData } : {}),
            consentCategories: ["necessary", ...categories],
            scripts,
            // The cookie lives as long as the choice it keeps (c15t's own default is 365 days).
            storageConfig: { storageKey: `${storageKey}-${version}`, defaultExpiryDays: EXPIRY_DAYS },
            colorScheme,
            theme: {
                // Same palette in both: with a dark scheme c15t reads `dark`, and falls back to its own
                // indigo, not to `colors`, for anything missing there.
                colors: palette,
                dark: palette,
                typography: { fontFamily },
                ...(radius ? { radius } : {}),
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
                        consent: { model: "opt-in", categories: [...ALL_CATEGORIES], expiryDays: EXPIRY_DAYS },
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
        }, children: [asksUpfront ? _jsx(Banner, {}) : null, _jsx(ConsentDialog, { hideBranding: true, legalLinks: LEGAL_LINKS }), _jsx(InsideManager.Provider, { value: true, children: embeds.length > 0 ? (_jsx(ExternalContentBridge, { services: embeds, children: children })) : (children) })] }));
}
/**
 * c15t's banner, rebuilt from its own parts to add the X the Garante asks for: top right, inside
 * the banner, closing it without consent. The stock banner has no close button.
 */
function Banner() {
    const { cookieBanner } = useTranslations();
    return (_jsx(ConsentBanner.Root, { children: _jsx("div", { className: "mediastar-consent-shell", children: _jsxs(ConsentBanner.Card, { "aria-label": cookieBanner.title, children: [_jsx(CloseWithoutConsent, {}), _jsxs(ConsentBanner.Header, { children: [_jsx(ConsentBanner.Title, {}), _jsx(ConsentBanner.Description, { legalLinks: LEGAL_LINKS })] }), _jsx(ConsentBanner.PolicyActions, {})] }) }) }));
}
/** The X: the same choice as "Rifiuta tutto", recorded as such. */
function CloseWithoutConsent() {
    const { saveConsents } = useConsentManager();
    return (_jsx("button", { type: "button", className: "mediastar-consent-close", "aria-label": "Chiudi senza accettare", title: "Chiudi senza accettare", onClick: () => void saveConsents("necessary", { uiSource: "banner" }), children: _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M6 6l12 12M18 6L6 18" }) }) }));
}
const ExternalContentContext = createContext(null);
function ExternalContentBridge({ services, children, }) {
    const { has, setConsent } = useConsentManager();
    const allowed = has("experience");
    const value = useMemo(() => ({
        allowed,
        allow: () => setConsent("experience", true),
        services: services.map((id) => EMBEDS[id].name),
    }), [allowed, setConsent, services]);
    return _jsx(ExternalContentContext.Provider, { value: value, children: children });
}
/** Inside a <ConsentManager> with `embeds`: whether maps and videos may load, and the way to allow
 *  them from their placeholder. Null outside it, where the placeholder decides on its own. */
export function useExternalContent() {
    return useContext(ExternalContentContext);
}
/** Whether a component sits inside a <ConsentManager>. */
const InsideManager = createContext(false);
/** The footer link that reopens the preferences dialog. A <button>; style it with `className`.
 *  Outside a <ConsentManager> it renders nothing: a page with nothing to ask has no preferences,
 *  and the footer can include the link unconditionally. */
export function PreferenzeCookie({ children = "Preferenze cookie", className, }) {
    if (!useContext(InsideManager))
        return null;
    return _jsx(ConsentDialogLink, { className: className, children: children });
}
/** Sends a GA4 event. Does nothing until the visitor has accepted "Statistica" and GA4 has loaded,
 *  so components can call it unconditionally, and consent stays one decision made in one place. */
export function gtagEvent(name, params) {
    if (typeof window === "undefined")
        return;
    const gtag = window.gtag;
    gtag?.("event", name, params);
}
