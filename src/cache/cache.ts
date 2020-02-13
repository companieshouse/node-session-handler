"use strict";

import Redis from "ioredis";

import config from "../config";
import { EitherAsync, Right, Either } from "purify-ts";
import { Failure } from "../error/FailureType";
import { GeneralSessonError, ErrorEnum, ResponseHandler, log } from "../error/ErrorFunctions";
import { SessionId } from "../session/model/SessionId";
import { Response } from "express";

export class Cache {

    private client: Redis.Redis;
    private errorFun =
        (callStack: any): ResponseHandler =>
            GeneralSessonError(ErrorEnum._promiseError)((res: Response) => (err: ErrorEnum) =>
                log(`Error: ${err}.\n${callStack}`));
    public static cacheInstance: Cache;

    constructor() {
        this.client = new Redis(`redis://${config.redis.address}`);
    }

    public static instance(): Cache {
        if (!this.cacheInstance) {
            Cache.cacheInstance = new Cache();
        }
        return Cache.cacheInstance;
    }

    async set(key: string, value: string): Promise<Either<Failure, string>> {
        return EitherAsync<Failure, string>(async ({ throwE }) =>
            await this.client.set(key, value).catch(err => throwE(Failure(this.errorFun(err))))).run();
    }

    async get(key: SessionId): Promise<Either<Failure, string>> {

        return EitherAsync<Failure, string>(async ({ liftEither, throwE }) => {
            const c = await this.client.get(key.value).catch(err => throwE(Failure(this.errorFun(err))));
            if (!c) return throwE(Failure(this.errorFun));
            return liftEither(Right(c));

        }).run();
    }

    async del(key: string): Promise<Either<Failure, number>> {
        return EitherAsync<Failure, number>(async ({ throwE }) =>
            await this.client.del(key).catch(err => throwE(Failure(this.errorFun(err))))).run();
    }
}
