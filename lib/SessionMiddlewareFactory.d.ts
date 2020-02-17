import { RequestHandler } from "express";
import { SessionStore } from "./session/SessionStore";
import { CookieConfig } from "./CookieConfig";
export declare class SessionMiddlewareFactory {
    private readonly config;
    private readonly sessionStore;
    constructor(config: CookieConfig, sessionStore: SessionStore);
    handler: () => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
}
