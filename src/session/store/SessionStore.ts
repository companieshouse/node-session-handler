import { Encoding } from "../../encoding/Encoding";
import { EitherAsync, Right, Left } from "purify-ts";
import { Failure } from "../../error/FailureType";
import {
    wrapValue,
    wrapFunction,
    wrapPromise,
} from "../../utils/EitherAsyncUtils";
import { PromiseError, NoDataRetrievedError, StoringError } from "../../error/ErrorFunctions";
import { Redis } from "ioredis";
import { Cookie } from "../model/Cookie";

export class SessionStore {

    private readonly redisWrapper: RedisWrapper;

    public constructor(readonly redis: Redis) {
        this.redisWrapper = new RedisWrapper(redis);
    }

    public load = <T>(cookie: Cookie): EitherAsync<Failure, T> => {

        const decode = wrapFunction<Failure, T, string>(Encoding.decode);

        return wrapValue<Failure, Cookie>(cookie)
            .map(_ => _.sessionId)
            .chain(this.redisWrapper.get)
            .chain(decode);
    };

    public store = <T>(cookie: Cookie, value: T): EitherAsync<Failure, string> => {
        return this.redisWrapper.set(cookie.sessionId, Encoding.encode(value));
    };

    public delete = (cookie: Cookie): EitherAsync<Failure, number> => {
        return this.redisWrapper.del(cookie.sessionId);
    };

}

class RedisWrapper {

    public constructor(private readonly client: Redis) { }

    public set = (key: string, value: string): EitherAsync<Failure, string> => {

        const promise = this.client.set(key, value)
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