import { Redis } from "ioredis";
import { ISession } from "../model/SessionInterfaces";
import { Cookie } from "../model/Cookie";
export declare class SessionStore {
    readonly redis: Redis;
    private readonly redisWrapper;
    constructor(redis: Redis);
    load: (cookie: Cookie) => Promise<string>;
    store: (cookie: Cookie, value: ISession, timeToLiveInSeconds?: number) => Promise<void>;
    delete: (cookie: Cookie) => Promise<void>;
}
