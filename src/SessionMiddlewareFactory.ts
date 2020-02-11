"use strict";

import { RequestHandler } from "express";
import cookie from "cookie";
import SessionValidator from "./SessionValidator";
import SessionStore from "./session/SessionStore";
import config from "./config";

class SessionMiddlewareFactory {

    static create(): RequestHandler {

        return async function (request, _response, next) {

            const cookies = cookie.parse(request.headers.cookie || "");
            const sessionCookie = cookies[config.session.cookieName];

            if (cookies[config.session.cookieName]) {

                const sessionValidator = new SessionValidator(sessionCookie, request.logger);
                const sessionId = sessionValidator.validateTokenAndRetrieveId();

                const sessionStore = new SessionStore(request.logger);
                const session = await sessionStore.load(sessionId);

                try {
                    session.validateExpiry();
                } catch (error) {
                    request.logger.error(error.message);
                }

                request.session = session;

            } else {
                /**
                 * Generate and redirect?
                 */
            }

            return next();
        }
    }
}

export = SessionMiddlewareFactory;
