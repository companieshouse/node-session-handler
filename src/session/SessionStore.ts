"use strict";

import { Cache } from "../cache/cache";
import { SessionKeys } from "./SessionKeys";
import { AccessToken } from "./model/AccessToken";
import { Encoding } from "../encoding/Encoding";
import { SessionId } from "./model/SessionId";
import { UnverifiedSession, VerifiedSession, Session } from "./model/Session";
import { ISignInInfo } from "./model/ISignInInfo";
import { Either, EitherAsync } from "purify-ts";
import { Failure } from "../error/FailureType";
import {
    liftEitherFunctionToAsyncEither,
    eitherPromiseFunctionToEitherAsync,
    liftToAsyncEither,
    eitherPromiseToEitherAsync
} from "../utils/EitherUtils";


export class SessionStore {

    private cache: Cache;

    constructor() {
        this.cache = Cache.instance();
    }

    private getAccessTokenData(session: Session): AccessToken | undefined {

        const rawAccessTokenData: ISignInInfo | undefined = session.data[SessionKeys.SignInInfo];

        return rawAccessTokenData ? rawAccessTokenData[SessionKeys.AccessToken] : undefined;
    }

    public load(sessionId: SessionId): EitherAsync<Failure, VerifiedSession> {

        const getFromCache = eitherPromiseFunctionToEitherAsync<Failure, string, SessionId>(this.cache.get);

        const decodeData =
            liftEitherFunctionToAsyncEither<Failure, UnverifiedSession, string>
                ((data: any) => Either.of(Encoding.decodeSession(data)));

        const validateSessionData =
            liftEitherFunctionToAsyncEither(VerifiedSession.createValidSession);


        return liftToAsyncEither<Failure, SessionId>(sessionId)
            .chain(getFromCache)
            .chain(decodeData)
            .chain(validateSessionData);

    }

    public store(session: UnverifiedSession): EitherAsync<Failure, string> {
        const encodedSessionData = Encoding.encodeSession(session);
        return eitherPromiseToEitherAsync(this.cache.set(session[SessionKeys.Id], encodedSessionData));

    };

}