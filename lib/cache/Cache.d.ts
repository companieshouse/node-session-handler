import { EitherAsync } from "purify-ts";
import { Failure } from "../error/FailureType";
import { Cookie } from "../session/model/Cookie";
import { SessionHandlerConfig } from "../SessionHandlerConfig";
import { Redis } from 'ioredis';
export declare class Cache {
    private readonly client;
    constructor(client: Redis);
    static redisInstance(config: SessionHandlerConfig): Redis;
    set: (key: string, value: string) => EitherAsync<Failure, string>;
    get: (key: Cookie) => EitherAsync<Failure, string>;
    del: (key: string) => EitherAsync<Failure, number>;
}
