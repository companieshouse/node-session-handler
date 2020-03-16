import { Redis } from "ioredis";
import { Cookie } from "../model/Cookie";
import { ISession } from "../..";
export declare class SessionStore {
    readonly redis: Redis;
    private readonly redisWrapper;
    constructor(redis: Redis);
    load: (cookie: Cookie) => Promise<string>;
    store: (cookie: Cookie, value: ISession, timeToLiveInSeconds?: number) => Promise<string>;
    delete: (cookie: Cookie) => Promise<number>;
}
