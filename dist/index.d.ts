import { ConsentManagerProvider } from "@c15t/nextjs";
import { type ComponentProps, type ReactNode } from "react";
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
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
/** Days before the banner asks again: the Garante wants at least six months. */
export declare const EXPIRY_DAYS = 180;
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
    };
    legalLinks: {
        privacyPolicy: string;
        cookiePolicy: string;
    };
};
export declare function ConsentManager({ children, backendURL, ga4Id, clarityId, scripts: extraScripts, categories, colors, colorScheme, fontFamily, privacyPolicyHref, cookiePolicyHref, messages, }: ConsentManagerProps): import("react").JSX.Element;
/** The footer link that reopens the preferences dialog. A <button>; style it with `className`. */
export declare function PreferenzeCookie({ children, className, }: {
    children?: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/** Sends a GA4 event. Does nothing until the visitor has accepted "Statistica" and GA4 has loaded —
 *  so components can call it unconditionally, and consent stays one decision made in one place. */
export declare function gtagEvent(name: string, params?: Record<string, unknown>): void;
export {};
