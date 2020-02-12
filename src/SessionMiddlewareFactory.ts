"use strict";
import { Request, Response, NextFunction } from "express";
import cookie from "cookie";
import { SessionValidator, Failure, Success } from "./SessionValidator";
import { SessionStore } from "./session/SessionStore";
import { Either } from "purify-ts";
import { SessionId } from './session/SessionId';
import { SessionKeys } from './session/SessionKeys';

export class SessionMiddlerwareFactory {
    private sessionStore: SessionStore;

    constructor(sessionStore: SessionStore) {
        this.sessionStore = sessionStore;
    }

    public createSessionMiddleware = () =>
        (request: Request, response: Response, next: NextFunction): void => {
            const cookies = cookie.parse(request.headers.cookie || "");

            const sessionCookie = cookies.__SID;

            if (cookies.__SID) {


                const maybeSessionId: Either<Failure, SessionId> =
                    SessionId.validSessionId(sessionCookie[SessionKeys.Id], sessionCookie[SessionKeys.ClientSig]);
                maybeSessionId.either(failure => {
                    failure.errorFunction(response);
                }, async success => {
                    request.session = await this.sessionStore.load(success.result.sessionIdValue);
                });
            }

            next();
        };
}

