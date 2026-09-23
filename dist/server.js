// @mediastar/consent/server — the site's consent settings from its environment, for the root layout
// (a Server Component). Not NEXT_PUBLIC_: read where the layout renders.
//
//   CONSENT_BACKEND_URL   the central register, https://consent.mediastarweb.it/api/c15t
//   GA4_MEASUREMENT_ID    G-…
//   CLARITY_PROJECT_ID    …
//
// WHEN THEY ARE READ. In a layout rendered per request (dynamic: it calls connection(), cookies(),
// headers()…) they are read at runtime and change on Coolify with a restart. In a static layout
// they are read once, at `next build`: set them as build variables too, and redeploy to change them.
const value = (name) => process.env[name]?.trim() || undefined;
export function consentEnv() {
    return {
        backendURL: value("CONSENT_BACKEND_URL"),
        ga4Id: value("GA4_MEASUREMENT_ID"),
        clarityId: value("CLARITY_PROJECT_ID"),
    };
}
