import { SessionHandlerConfig } from "./SessionHandlerConfig";
import { SessionStore } from "./session/SessionStore";
import { RequestHandler } from "express";
import * as EitherUtils from "./utils/EitherUtils";
export interface CHSessionService {
    readonly config: SessionHandlerConfig;
    readonly sessionStore: SessionStore;
    readonly sessionHandler: RequestHandler;
}
export declare const CHSessionServiceInstance: (config: SessionHandlerConfig) => CHSessionService;
export { SessionHandlerConfig, EitherUtils };
