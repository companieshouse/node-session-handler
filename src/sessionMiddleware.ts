"use strict";

import { RequestHandler } from "express";
import cookie from "cookie";

class SessionMiddlewareFactory {

    static create(options): RequestHandler {

        return function (request, response, next) {

            response.cookie("test", "abc123");

            // cookie.serialize(, "abc123");
            const cookies = cookie.parse(request.headers.cookie || "");

            if (cookies["__SID"]) {
                
            }

            console.log(cookies);

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
            return next();
        }
    }
}

export = SessionMiddlewareFactory;
