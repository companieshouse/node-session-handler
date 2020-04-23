import { Redis } from "ioredis";
import { DeletionError, NoDataRetrievedError, RetrievalError, StoringError } from "./Errors";
import { ISession } from "../model/SessionInterfaces";
import { Encoding } from "../../encoding/Encoding";
import { getSecondsSinceEpoch } from "../../utils/TimeUtils";
import { SessionKey } from "../keys/SessionKey";
import { Cookie } from "../model/Cookie";

export class SessionStore {

    private readonly redisWrapper: RedisWrapper;

    public constructor(readonly redis: Redis) {
        this.redisWrapper = new RedisWrapper(redis);
    }

    public load = async (cookie: Cookie): Promise<string> => {
        return Encoding.decode(await this.redisWrapper.get(cookie.sessionId));
    };

    public store = async (cookie: Cookie, value: ISession, timeToLiveInSeconds: number = 3600): Promise<void> => {
        value[SessionKey.Expires] = getSecondsSinceEpoch() + timeToLiveInSeconds;
        return this.redisWrapper.set(cookie.sessionId, Encoding.encode(value), timeToLiveInSeconds);
    };

    public delete = async (cookie: Cookie): Promise<void> => {
        return this.redisWrapper.del(cookie.sessionId);
    };
}

class RedisWrapper {

    public constructor(private readonly client: Redis) { }

    public set = async (key: string, value: string, timeToLiveInSeconds: number): Promise<void> => {

        return this.client.set(key, value, "EX", timeToLiveInSeconds)
            .then(() => { return })
            .catch(err => {
                throw new StoringError(key, value, err)
            });
    };

    public get = async (key: string): Promise<string> => {

        const checkIfResultEmpty = (result: string) => {
            if (!result) {
                throw new NoDataRetrievedError(key);
            }
            return result;
        };

        return this.client.get(key)
            .then(checkIfResultEmpty)
            .catch(err => {
                throw new RetrievalError(key, err)
            });
    };

    public del = async (key: string): Promise<void> => {

        return this.client.del(key)
            .then(() => { return })
            .catch(err => {
                throw new DeletionError(key, err)
            });
    };
}
