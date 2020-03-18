import { EitherAsync, Left, Right } from "purify-ts";
import { NoDataRetrievedError, PromiseError, StoringError } from "../../error/ErrorFunctions";
import {
    wrapFunction,
    wrapPromise,
    wrapValue
} from "../../utils/EitherAsyncUtils";

import { Cookie } from "../model/Cookie";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Encoding } from "../../encoding/Encoding";
import { Failure } from "../../error/FailureType";
import { ISession } from "../..";
import { Redis } from "ioredis";
import { SessionKey } from "../keys/SessionKey";
import { getSecondsSinceEpoch } from "../../utils/TimeUtils";

export class SessionStore {

    private readonly redisWrapper: RedisWrapper;

    public constructor(readonly redis: Redis) {
        this.redisWrapper = new RedisWrapper(redis);
    }

    public load = (cookie: Cookie): EitherAsync<Failure, ISession> => {

        const decode = wrapFunction<Failure, ISession, string>(Encoding.decode);

        return wrapValue<Failure, Cookie>(cookie)
            .map(_ => _.sessionId)
            .chain(this.redisWrapper.get)
            .chain(decode);
    };

    public store = (cookie: Cookie, value: ISession, timeToLiveInSeconds: number = 3600): EitherAsync<Failure, string> => {
        value[SessionKey.Expires] = getSecondsSinceEpoch() + timeToLiveInSeconds;
        return this.redisWrapper.set(cookie.sessionId, Encoding.encode(value), timeToLiveInSeconds);
    };

    public delete = (cookie: Cookie): EitherAsync<Failure, number> => {
        return this.redisWrapper.del(cookie.sessionId);
    };

}

class RedisWrapper {

    public constructor(private readonly client: Redis) { } // eslint-disable-line no-useless-constructor

    public set = (key: string, value: string, timeToLiveInSeconds: number): EitherAsync<Failure, string> => {

        const promise = this.client.set(key, value, "EX", timeToLiveInSeconds)
            .then(r => Right(r))
            .catch(err => Left(Failure(StoringError(err, key, value))));

        return wrapPromise<Failure, string>(promise);
    };

    public get = (key: string): EitherAsync<Failure, string> => {

        const checkIfResultEmpty = (result: string) => {

            if (!result) {
                return Left(Failure(NoDataRetrievedError(key)));
            }

            return Right(result);

        };

        const promise = () => this.client.get(key)
            .then(checkIfResultEmpty)
            .catch(err => Left<Failure, string>(Failure(PromiseError(err))));

        return wrapPromise(promise());
    };

    public del = (key: string): EitherAsync<Failure, number> => {

        const promise = this.client.del(key)
            .then(r => Right(r))
            .catch(err => Left(Failure(PromiseError(err))));

        return wrapPromise(promise);
    };
}
