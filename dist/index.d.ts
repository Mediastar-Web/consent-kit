import { ConsentManagerProvider, type InitialDataPromise } from "@c15t/nextjs";
import { type ComponentProps, type ReactNode } from "react";
import { type EmbedId, type Trackers } from "./vendors.js";
export { EMBEDS, TRACKERS, type Category, type EmbedId, type TrackerId, type Trackers } from "./vendors.js";
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
/** Corner rounding, as c15t names it: `lg` the banner and dialog cards, `md` the buttons. */
export type ConsentRadius = Partial<{
    sm: string;
    md: string;
    lg: string;
    full: string;
}>;
type Scripts = NonNullable<ComponentProps<typeof ConsentManagerProvider>["options"]["scripts"]>;
export type ConsentManagerProps = {
    children: ReactNode;
    /** The central register's c15t API: absolute (https://consent.mediastarweb.it/api/c15t) or a
     *  same-origin proxy (/api/c15t). Empty: the choice stays in the browser only. */
    backendURL?: string;
    /** The register's /init answer, fetched on the server with `initialData()` from
     *  "@mediastar/consent/server": the browser then skips that request on every page. */
    ssrData?: InitialDataPromise;
    /** Analytics and advertising tools, by ID: loaded only once their category is granted. */
    trackers?: Trackers;
    /** The services the pages embed (maps, videos). Their placeholders ask in place: see
     *  `useExternalContent()`. */
    embeds?: readonly EmbedId[];
    /** Other consent-gated scripts (c15t Script objects), each with its category. */
    scripts?: Scripts;
    /** Palette. Default: light neutrals with the Mediastar orange. */
    colors?: ConsentColors;
    radius?: ConsentRadius;
    /** "light", "dark" or "system". Default "light". */
    colorScheme?: "light" | "dark" | "system";
    /** Font for the banner and dialog. Default: the page's own (inherit). The banner is portaled
     *  to <body>: a font declared on an inner element does not reach it, pass its family instead. */
    fontFamily?: string;
    /** Where the privacy policy lives. Default "/privacy". */
    privacyPolicyHref?: string;
    /** Where the cookie policy lives. Omitted: no cookie policy link. */
    cookiePolicyHref?: string;
    /** Italian copy overrides, deep-merged over the defaults (same shape as `DEFAULT_MESSAGES`). */
    messages?: DeepPartial<typeof DEFAULT_MESSAGES>;
    /** Name of the cookie and localStorage entry that keep the choice. One per site when several
     *  sites share an origin. The tools in use are appended to it. Default "c15t". */
    storageKey?: string;
};
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
/** Days before the banner asks again. The Garante wants at least six months, and six calendar
 *  months are 181 to 184 days: 180 would ask one day early. */
export declare const EXPIRY_DAYS = 185;
export declare const DEFAULT_MESSAGES: {
    common: {
        acceptAll: string;
        rejectAll: string;
        customize: string;
        save: string;
        close: string;
    };
    cookieBanner: {
        title: string;
        description: string;
    };
    consentManagerDialog: {
        title: string;
        description: string;
    };
    consentTypes: {
        necessary: {
            title: string;
            description: string;
        };
        measurement: {
            title: string;
            description: string;
        };
        marketing: {
            title: string;
            description: string;
        };
        experience: {
            title: string;
            description: string;
        };
    };
    legalLinks: {
        privacyPolicy: string;
        cookiePolicy: string;
    };
};
export declare function ConsentManager({ children, backendURL, ssrData, trackers, embeds, scripts: extraScripts, colors, radius, colorScheme, fontFamily, privacyPolicyHref, cookiePolicyHref, messages, storageKey, }: ConsentManagerProps): import("react").JSX.Element;
/** What a map or video placeholder needs from the consent state. */
export type ExternalContent = {
    /** "Contenuti esterni" is granted: embeds load straight away. */
    allowed: boolean;
    /** Grants "Contenuti esterni" for the whole site, recorded like any other choice. */
    allow: () => void;
    /** The names of the services the site embeds, for the placeholder's text. */
    services: string[];
};
/** Inside a <ConsentManager> with `embeds`: whether maps and videos may load, and the way to allow
 *  them from their placeholder. Null outside it, where the placeholder decides on its own. */
export declare function useExternalContent(): ExternalContent | null;
/** The footer link that reopens the preferences dialog. A <button>; style it with `className`.
 *  Outside a <ConsentManager> it renders nothing: a page with nothing to ask has no preferences,
 *  and the footer can include the link unconditionally. */
export declare function PreferenzeCookie({ children, className, }: {
    children?: ReactNode;
    className?: string;
}): import("react").JSX.Element | null;
/** Sends a GA4 event. Does nothing until the visitor has accepted "Statistica" and GA4 has loaded,
 *  so components can call it unconditionally, and consent stays one decision made in one place. */
export declare function gtagEvent(name: string, params?: Record<string, unknown>): void;
