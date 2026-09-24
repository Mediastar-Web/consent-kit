import { fetchInitialData } from "@c15t/nextjs";
const value = (name) => process.env[name]?.trim() || undefined;
export function consentEnv() {
    return {
        backendURL: value("CONSENT_BACKEND_URL"),
        trackers: {
            ga4: value("GA4_MEASUREMENT_ID"),
            clarity: value("CLARITY_PROJECT_ID"),
        },
    };
}
/** How long the register's startup data is reused. A change to the policy reaches the sites within
 *  this time. */
const STARTUP_CACHE_SECONDS = 3600;
/**
 * The register's /init answer, for `<ConsentManager ssrData>`: with it the browser skips the /init
 * request it would otherwise make on every page, so the register hears from a site when a visitor
 * chooses, not on every page view. Pass the Promise without awaiting it: the page streams while it
 * resolves.
 *
 * The answer is the same for every visitor (one rule for everyone, Italian texts), so it is asked
 * for as from Italy and cached. Undefined without a backend URL.
 *
 * `backendURL` is the register's own address, even when the browser reaches it through a
 * same-origin proxy (`<ConsentManager backendURL="/api/c15t">`). c15t only reuses an answer fetched
 * from the very URL the browser uses, and would discard this one and ask again: it is the same
 * register and the same answer, so the request details it compares are dropped.
 *
 * Reads the request headers, so the page that calls it renders per request.
 */
export function initialData(backendURL) {
    if (!backendURL)
        return undefined;
    return fetchInitialData({
        backendURL,
        overrides: { country: "IT", language: "it" },
        nextCache: { revalidateSeconds: STARTUP_CACHE_SECONDS },
    }).then((data) => (data ? { ...data, metadata: undefined } : data));
}
