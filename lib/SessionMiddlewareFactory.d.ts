import { Request, Response, NextFunction } from "express";
import { SessionStore } from "./session/SessionStore";
import { SessionHandlerConfig } from "./SessionHandlerConfig";
export declare class SessionMiddlewareFactory {
    private readonly config;
    private readonly sessionStore;
    constructor(config: SessionHandlerConfig, sessionStore: SessionStore);
    handler: () => (request: Request<import("express-serve-static-core").ParamsDictionary>, response: Response, next: NextFunction) => Promise<any>;
}
