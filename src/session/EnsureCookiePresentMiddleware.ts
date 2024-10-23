import { NextFunction, Request, RequestHandler, Response } from "express"
import { CookiePresenceConfig } from "../config/CookiePresenceConfig";

const DEFAULT_REDIRECT_QUERY_PARAM_NAME = "redirect";
const DEFAULT_REDIRECT_QUERY_PARAM_VALUE = "true";


export function EnsureSessionCookiePresentMiddleware(config: CookiePresenceConfig): RequestHandler {
    const redirectQueryParameterName =
        config.redirectQueryParameterName || DEFAULT_REDIRECT_QUERY_PARAM_NAME;
    const redirectQueryParameterValue =
        config.redirectQueryParameterValue || DEFAULT_REDIRECT_QUERY_PARAM_VALUE;

    const hasPreviouslyBeenRedirected = (req: Request) =>
        typeof req.query !== "undefined" &&
            req.query[redirectQueryParameterName] === redirectQueryParameterValue

    return (req: Request, res: Response, next: NextFunction) => {
        if (!Object.keys(req.cookies).includes(config.cookieName)) {
            const previousRedirect = hasPreviouslyBeenRedirected(req);

            if (previousRedirect) {
                throw new Error("Session Cookie Not Set")
            }

            return res.redirect(`${req.url}?${redirectQueryParameterName}=${redirectQueryParameterValue}`)
        }

        next();
    }
}
