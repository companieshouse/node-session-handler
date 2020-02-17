import { Cache } from "../cache/Cache";
import { SessionKeys } from "./SessionKeys";
import { AccessToken } from "./model/AccessToken";
import { Encoding } from "../encoding/Encoding";
import { VerifiedSession, Session } from "./model/Session";
import { ISignInInfo } from "./model/ISignInInfo";
import { EitherAsync } from "purify-ts";
import { Failure } from "../error/FailureType";
import {
    liftToAsyncEither,
    liftEitherToAsyncEither,
    liftFunctionToAsyncEither,
} from "../utils/EitherUtils";
import { Cookie } from "./model/Cookie";

export class SessionStore {


    public constructor(private readonly cache: Cache) {
    }

    private getAccessTokenData(session: Session): AccessToken | undefined {

        const rawAccessTokenData: ISignInInfo | undefined = session.data[SessionKeys.SignInInfo];

        return rawAccessTokenData ? rawAccessTokenData[SessionKeys.AccessToken] : undefined;
    }

    public load = (cookie: Cookie): EitherAsync<Failure, VerifiedSession> => {

        const decodeSession = liftFunctionToAsyncEither<Failure, Session, string>(Encoding.decodeSession);

        return liftToAsyncEither<Failure, Cookie>(cookie)
            .chain(this.cache.get)
            .chain(decodeSession)
            .chain(session => liftEitherToAsyncEither(session.verify()));

    }

    public store = (session: Session): EitherAsync<Failure, string> => {
        const encodedSessionData = Encoding.encodeSession(session);
        return this.cache.set(session.data[SessionKeys.Id], encodedSessionData);

    };

}