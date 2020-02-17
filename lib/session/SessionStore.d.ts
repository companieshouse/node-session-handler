import { EitherAsync } from "purify-ts";
import { Failure } from "../error/FailureType";
import { Redis } from "ioredis";
import { Cookie } from "./model/Cookie";
export declare class SessionStore {
    readonly redis: Redis;
    private readonly redisWrapper;
    constructor(redis: Redis);
    load: <T>(cookie: Cookie) => EitherAsync<Failure, T>;
    store: <T>(cookie: Cookie, value: T) => EitherAsync<Failure, string>;
    delete: (cookie: Cookie) => EitherAsync<Failure, number>;
}
