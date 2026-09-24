import { type InitialDataPromise } from "@c15t/nextjs";
import type { Trackers } from "./vendors.js";
export type ConsentEnv = {
    backendURL?: string;
    trackers: Trackers;
};
export declare function consentEnv(): ConsentEnv;
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
export declare function initialData(backendURL: string | undefined): InitialDataPromise | undefined;
