import { Encoding } from "../../encoding/Encoding";
import { PromiseError, NoDataRetrievedError, StoringError } from "../../error/ErrorFunctions";
import { Redis } from "ioredis";
import { Cookie } from "../model/Cookie";
import { ISession } from "../..";
import { SessionKey } from "../keys/SessionKey";
import { getSecondsSinceEpoch } from "../../utils/TimeUtils";

export class SessionStore {

    private readonly redisWrapper: RedisWrapper;

    public constructor(readonly redis: Redis) {
        this.redisWrapper = new RedisWrapper(redis);
    }

    public load = async (cookie: Cookie): Promise<string> => {

        try {
            return Encoding.decode(await this.redisWrapper.get(cookie.sessionId));
        } catch (err) {
            console.error(err);
        }
    };

    public store = async (cookie: Cookie, value: ISession, timeToLiveInSeconds: number = 3600): Promise<string> => {

        try {
            value[SessionKey.Expires] = getSecondsSinceEpoch() + timeToLiveInSeconds;
            return this.redisWrapper.set(cookie.sessionId, Encoding.encode(value), timeToLiveInSeconds);
        } catch (err) {
            console.error(err);
        }
    };

    public delete = async (cookie: Cookie): Promise<number> => {

        try {
            return this.redisWrapper.del(cookie.sessionId);
        } catch (err) {
            console.error(err);
        }
    };

}

class RedisWrapper {

    public constructor(private readonly client: Redis) { }

    public set = async (key: string, value: string, timeToLiveInSeconds: number): Promise<string> => {

        const promise = this.client.set(key, value, "EX", timeToLiveInSeconds)
            .catch(err => StoringError(err, key, value));

        return promise;
    };

    public get = async (key: string): Promise<string> => {

        const checkIfResultEmpty = (result: string) => {

            if (!result) {
                return (NoDataRetrievedError(key));
            }

            return result;

        };

        const promise = () => this.client.get(key)
            .then(checkIfResultEmpty)
            .catch(PromiseError);

        return promise();
    };

    public del = async (key: string): Promise<number> => {

        const promise = this.client.del(key)
            .catch(PromiseError);

        return promise;
    };
}