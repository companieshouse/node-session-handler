import { RequestHandler } from "express";
import { SessionStore } from "./store/SessionStore";
import { CookieConfig } from "../config/CookieConfig";
export declare function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler;
