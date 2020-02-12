"use strict";

import SessionMiddlewareFactory from "./session/SessionMiddlewareFactory";
import Session = require("./session/Session");

declare global {
    namespace Express {
        interface Request {
            session: Session
        }
    }
}

export = SessionMiddlewareFactory;
