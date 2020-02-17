
import { EitherAsync, Right, Either, Left } from "purify-ts";
import { Failure } from "../error/FailureType";
import { PromiseError, NoDataRetrievedError } from "../error/ErrorFunctions";

import { eitherPromiseToEitherAsync } from "../utils/EitherUtils";
import { Cookie } from "../session/model/Cookie";
import { SessionHandlerConfig } from "../SessionHandlerConfig";
import { Redis } from 'ioredis';
import IORedis = require('ioredis');

export class Cache {


    public constructor(private readonly client: Redis) { }

    public static redisInstance(config: SessionHandlerConfig): Redis {

        return new IORedis(`redis://:${config.cachePassword}@${config.cacheServer}/${config.cacheDB}`);

    }

    public set = (key: string, value: string): EitherAsync<Failure, string> => {
        return eitherPromiseToEitherAsync<Failure, string>(this.client.set(key, value)
            .then(r => Either.of<Failure, string>(r))
            .catch(err => Left<Failure, string>(Failure(PromiseError(err)))));
    }

    public get = (key: Cookie): EitherAsync<Failure, string> => {
        return eitherPromiseToEitherAsync(this.client.get(key.sessionId)
            .then(result => Either.of<Failure, string>(result).chain(r => {
                if (!r) return Left(Failure(NoDataRetrievedError(key.value)));
                return Right(r);
            })
            ).catch(err => Left<Failure, string>(Failure(PromiseError(err)))));
    }

    public del = (key: string): EitherAsync<Failure, number> => {
        return eitherPromiseToEitherAsync(this.client.del(key)
            .then(r => Either.of<Failure, number>(r))
            .catch(err => Left<Failure, number>(Failure(PromiseError(err)))));
    }
}