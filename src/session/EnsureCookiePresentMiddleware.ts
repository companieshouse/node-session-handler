import { NextFunction, Request, RequestHandler, Response } from "express"
import { CookiePresenceConfig } from "../config/CookiePresenceConfig";

const DEFAULT_REDIRECT_QUERY_PARAM_NAME = "redirect";
const DEFAULT_REDIRECT_QUERY_PARAM_VALUE = "true";

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
    const { redirectQueryParameterName, redirectQueryParameterValue } = redirectionParametersSupplier(config);

    const hasPreviouslyBeenRedirected = previousRedirectPredicateFactory(redirectQueryParameterName,
        redirectQueryParameterValue);

    const constructQueryString = queryStringSupplierFactory(redirectQueryParameterName,
        redirectQueryParameterValue);

    return (req: Request, res: Response, next: NextFunction) => {
        if (!Object.keys(req.cookies).includes(config.cookieName)) {
            const previousRedirect = hasPreviouslyBeenRedirected(req);

            if (previousRedirect) {
                throw new Error("Session Cookie Not Set")
            }

            const queryString = constructQueryString(req)

            return res.redirect(`${req.url}?${queryString}`)
        }

        next();
    }
}

/**
 * Produces a predicate which will determine whether a request has been
 * previously redirected
 * @param redirectQueryParameterName name of the query parameter which identifies
 *      a redirected request
 * @param redirectQueryParameterValue value of the query parameter which identifies
 *      a redirected request
 * @returns (req: Request) => boolean identifying redirected requests
 */
const previousRedirectPredicateFactory = (redirectQueryParameterName: string, redirectQueryParameterValue: string) => (req: Request) =>
    typeof req.query !== "undefined" &&
    req.query[redirectQueryParameterName] === redirectQueryParameterValue;

/**
 * Produces a supplier of query strings concatenating the redirection parameters
 * @param redirectQueryParameterName name of the query parameter which identifies
 *      a redirected request
 * @param redirectQueryParameterValue value of the query parameter which identifies
 *      a redirected request
 * @returns (req: Request) => string string representation of query parameters
 * for the onward request
 */
const queryStringSupplierFactory = (redirectQueryParameterName: string, redirectQueryParameterValue: string) => (req: Request) => {
    const newQuery = {
        ...(req.query || {}),
        [redirectQueryParameterName]: redirectQueryParameterValue
    }

    return Object.entries(newQuery)
        .map(([paramName, paramValue]) => `${paramName}=${paramValue}`)
        .reduce((prev, current) => prev ? `${prev}&${current}` : current, undefined)
}

/**
 * Determines the redirection parameters to use given the config
 * @param config middleware configuration with potential values for redirection
 *      parameters
 * @returns object containing the parameters
 */
const redirectionParametersSupplier = (config: CookiePresenceConfig): {
    redirectQueryParameterName: string,
    redirectQueryParameterValue: string,
} => ({
    redirectQueryParameterName: config.redirectQueryParameterName || DEFAULT_REDIRECT_QUERY_PARAM_NAME,
    redirectQueryParameterValue: config.redirectQueryParameterValue || DEFAULT_REDIRECT_QUERY_PARAM_VALUE
})
