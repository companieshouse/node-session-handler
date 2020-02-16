/// <reference types="express" />
import { SessionHandlerConfig } from "./SessionHandlerConfig";
export declare const CHSessionMiddleware: (config: SessionHandlerConfig) => (request: import("express").Request<import("express-serve-static-core").ParamsDictionary>, response: import("express").Response, next: import("express").NextFunction) => Promise<any>;
export { SessionHandlerConfig };
