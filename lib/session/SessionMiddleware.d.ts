import { RequestHandler } from "express";
import { CookieConfig } from "../config/CookieConfig";
import { SessionStore } from "./store/SessionStore";
export declare function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore, createSessionWhenCookieNotFound?: boolean): RequestHandler;
