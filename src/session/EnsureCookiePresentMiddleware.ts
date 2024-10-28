import { NextFunction, Request, RequestHandler, Response } from "express"
import { CookiePresenceConfig } from "../config/CookiePresenceConfig";

const DEFAULT_REDIRECT_HEADER_NAME = "x-redirection-count";
const DEFAULT_REDIRECT_HEADER_VALUE = "1";

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
export function EnsureSessionCookiePresentMiddleware(config: CookiePresenceConfig): RequestHandler {
    const { redirectHeaderName, redirectHeaderValue } = redirectionParametersSupplier(config);

    const hasPreviouslyBeenRedirected = previousRedirectPredicateFactory(redirectHeaderName,
        redirectHeaderValue);

    return (req: Request, res: Response, next: NextFunction) => {
        const previouslyRedirected = hasPreviouslyBeenRedirected(req);

        if (!Object.keys(req.cookies).includes(config.cookieName)) {
            if (previouslyRedirected) {
                throw new Error("Session Cookie Not Set")
            }

            return res.header(redirectHeaderName, redirectHeaderValue).redirect(req.originalUrl)
        } else if (previouslyRedirected) {
            res.removeHeader(redirectHeaderName)
        }

        next();
    }
}

/**
 * Produces a predicate which will determine whether a request has been
 * previously redirected
 * @param redirectHeaderName name of the header which identifies
 *      a redirected request
 * @param redirectHeaderValue value of the header which identifies
 *      a redirected request
 * @returns (req: Request) => boolean identifying redirected requests
 */
const previousRedirectPredicateFactory = (redirectHeaderName: string, redirectHeaderValue: string) => (req: Request) =>
    req.get(redirectHeaderName) === redirectHeaderValue;


/**
 * Determines the redirection parameters to use given the config
 * @param config middleware configuration with potential values for redirection
 *      parameters
 * @returns object containing the parameters
 */
const redirectionParametersSupplier = (config: CookiePresenceConfig): {
    redirectHeaderName: string,
    redirectHeaderValue: string,
} => ({
    redirectHeaderName: config.redirectHeaderName || DEFAULT_REDIRECT_HEADER_NAME,
    redirectHeaderValue: config.redirectHeaderValue || DEFAULT_REDIRECT_HEADER_VALUE
})
