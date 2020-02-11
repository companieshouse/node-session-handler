"use strict";

import { RequestHandler } from "express";
import cookie from "cookie";
import SessionValidator from "./SessionValidator";

class SessionMiddlewareFactory {

    static create(): RequestHandler {

        return function (request, _response, next) {

            const cookies = cookie.parse(request.headers.cookie || "");

            /**
             * Check __sid exists in cookie
             * Get __sid from cookie
             * Strip Session ID and signature from it
             * Validate signature against a generated signature
             * If pass - get data from session store
             * Base64 decode it
             * Messagepack decode it
             * Validate the expiry
             * Add session to request
             */
            const sessionCookie = cookies["__SID"];

            if (cookies["__SID"]) {

                const sessionValidator = new SessionValidator(sessionCookie, request.logger);
                const sessionId = sessionValidator.validateTokenAndRetrieveId();

                request.session = SessionStore

            } else {
                /**
                 * Generate and redirect?
                 */
            }

            console.log(cookies);

            return next();
        }
    }
}

export = SessionMiddlewareFactory;
