/* eslint-disable prefer-promise-reject-errors */
import { Arg, Substitute } from "@fluffy-spoon/substitute";
import { assert, expect } from "chai";

import { Cookie } from "../../src/session/model/Cookie";
import { Encoding } from "../../src/encoding/Encoding";
import { ISession } from "../../src";
import { Redis } from "ioredis";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SessionStore } from "../../src/session/store/SessionStore";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { getSecondsSinceEpoch } from "../../src/utils/TimeUtils";

describe("Store", () => {
    const cookie = Cookie.create(generateRandomBytesBase64(16));
    const data: ISession = {
        [SessionKey.ExtraData]: {
            name: "Mark",
            age: 18
        }
    };

    describe("data loading", () => {
        it("should read from cache using session id and decode data after read", async () => {
            const redis = Substitute.for<Redis>();
            redis.get(cookie.sessionId).returns(Promise.resolve(Encoding.encode(data)));

            const result = await new SessionStore(redis).load(cookie).run();
            result.either(
                () => assert.fail(),
                response => expect(response).to.be.deep.equal(data)
            );

            redis.received().get(cookie.sessionId);
        });

        it("should return failure when read failed", async () => {
            const redis = Substitute.for<Redis>();
            redis.get(cookie.sessionId).returns(Promise.reject("Some error"));

            const result = await new SessionStore(redis).load(cookie).run();
            expect(result.isLeft()).to.equal(true);
        });
    });

    describe("data storing", () => {
        it("should reset session expiry time and write to cache using session id and encode data before write", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, Arg.any(), "EX", 3600).returns(Promise.resolve("OK"));

            const result = await new SessionStore(redis).store(cookie, data).run();
            result.either(
                () => assert.fail(),
                response => expect(response).to.be.equal("OK")
            );

            // @ts-ignore
            redis.received().set(cookie.sessionId, Arg.is(encodedDataArg => {
                const decodedSession: ISession = Encoding.decode(encodedDataArg);
                return JSON.stringify(decodedSession[SessionKey.ExtraData]) === JSON.stringify(data[SessionKey.ExtraData]) &&
                    decodedSession[SessionKey.Expires] != null &&
                    decodedSession[SessionKey.Expires] === getSecondsSinceEpoch() + 3600;
            }), "EX", 3600);
        });

        it("should return failure when write failed", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, Arg.any(), "EX", 3600).returns(Promise.reject("Some error"));

            const result = await new SessionStore(redis).store(cookie, data).run();
            expect(result.isLeft()).to.equal(true);
        });
    });

    describe("deleting storing", () => {
        it("should delete from cache using session id", async () => {
            const redis = Substitute.for<Redis>();
            redis.del(Arg.any()).returns(Promise.resolve(1));

            const result = await new SessionStore(redis).delete(cookie).run();
            result.either(
                () => assert.fail(),
                response => expect(response).to.be.equal(1)
            );

            // @ts-ignore
            redis.received().del(cookie.sessionId);
        });

        it("should return failure when delete failed", async () => {
            const redis = Substitute.for<Redis>();
            redis.del(cookie.sessionId).returns(Promise.reject("Some error"));

            const result = await new SessionStore(redis).delete(cookie).run();
            expect(result.isLeft()).to.equal(true);
        });
    });
});
