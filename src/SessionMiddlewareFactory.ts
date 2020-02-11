"use strict";

import { RequestHandler } from "express";
import cookie from "cookie";
import SessionValidator from "./SessionValidator";
import SessionStore from "./session/SessionStore";

class SessionMiddlewareFactory {

    static create(): RequestHandler {

        return async function (request, _response, next) {

            const cookies = cookie.parse(request.headers.cookie || "");

            const sessionCookie = cookies["__SID"];

            if (cookies["__SID"]) {

                const sessionValidator = new SessionValidator(sessionCookie, request.logger);
                const sessionId = sessionValidator.validateTokenAndRetrieveId();

                const sessionStore = new SessionStore(request.logger);
                request.session = await sessionStore.load(sessionId);

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
