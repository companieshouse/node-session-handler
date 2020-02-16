import { Cache } from "../cache/Cache";
import { VerifiedSession, Session } from "./model/Session";
import { EitherAsync } from "purify-ts";
import { Failure } from "../error/FailureType";
import { Cookie } from "./model/Cookie";
export declare class SessionStore {
    private readonly cache;
    constructor(cache: Cache);
    private getAccessTokenData;
    load: (cookie: Cookie) => EitherAsync<Failure, VerifiedSession>;
    store: (session: Session) => EitherAsync<Failure, string>;
}
