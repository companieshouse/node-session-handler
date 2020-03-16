import { EitherAsync } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { Redis } from "ioredis";
import { Cookie } from "../model/Cookie";
import { ISession } from "../..";
export declare class SessionStore {
    readonly redis: Redis;
    private readonly redisWrapper;
    constructor(redis: Redis);
    load: (cookie: Cookie) => EitherAsync<Failure, ISession>;
    store: (cookie: Cookie, value: ISession, timeToLiveInSeconds?: number) => EitherAsync<Failure, string>;
    delete: (cookie: Cookie) => EitherAsync<Failure, number>;
}
