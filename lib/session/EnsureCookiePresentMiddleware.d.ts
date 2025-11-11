import { RequestHandler } from "express";
import { CookiePresenceConfig } from "../config/CookiePresenceConfig";
/**
 * A firebreak middleware which will redirect requests without a session cookie. If
 * it previously failed will raise an error.
 *
 * Requires `query` to be populated therefore will not work as expected if query parsing
 * is disabled
 * @param config containing the properties which the middleware uses to operate
 * @returns Request handler capable of performing the validation that the session cookie is
 * present in the request
 */
export declare function EnsureSessionCookiePresentMiddleware(config: CookiePresenceConfig): RequestHandler;
