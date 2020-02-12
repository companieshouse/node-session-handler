"use strict";

import cache from "../cache";
import { Session } from "./Session";
import { SessionKeys } from "./SessionKeys";
import { AccessTokenData } from "./model/AccessTokenData";
import { Encoding } from "../encoding/Encoding";

export class SessionStore {

    private _sessionExpiredError = "Session has expired.";

    private getAccessTokenData(data: any): AccessTokenData | undefined {

        const rawAccessTokenData = data[SessionKeys.AccessToken];

        return rawAccessTokenData ?
            new AccessTokenData(rawAccessTokenData) :
            undefined;
    }

    public async load(sessionId: string): Promise<Session> {

        let encodedData;

        try {
            encodedData = await cache.get(sessionId);

        } catch (error) {
            throw new Error("Error trying to retrieve from cache");
        }

        const data = await Encoding.decodeSession(encodedData);

        const accessTokenData = this.getAccessTokenData(data);

        if (accessTokenData && accessTokenData.expiresIn) {
            this.validateExpiration(accessTokenData.expiresIn);
        }

        return new Session(sessionId, accessTokenData);
    }

    public async store(session: Session): Promise<string> {

        const encodedSessionData = await Encoding.encodeSession(session);

        try {

            cache.set(session.id, encodedSessionData);

        } catch (err) {
            throw new Error("Error trying to store data in cache.");
        }

        return encodedSessionData;
    };

    private validateExpiration(expiresIn: number): void {

        if (expiresIn <= Date.now()) {

            throw new Error(this._sessionExpiredError);
        }
    }

}