import { Arg, Substitute } from "@fluffy-spoon/substitute";
import { assert, expect } from "chai";
import { Redis } from "ioredis";
import { ISession } from "../../src";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { Cookie } from "../../src/session/model/Cookie";
import { DeletionError, RetrievalError, StoringError } from "../../src/session/store/Errors";
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

            expect(await new SessionStore(redis).load(cookie)).to.be.deep.equal(data);

            redis.received().get(cookie.sessionId);
        });

        it("should throw error when read failed",  async () => {
            const redis = Substitute.for<Redis>();
            redis.get(cookie.sessionId).returns(Promise.reject("Some error"));

            try {
                await new SessionStore(redis).load(cookie);
                assert.fail();
            } catch (err) {
                expect(err).to.be.instanceOf(RetrievalError)
                expect(err.message).to.equal(`Data retrieval failed for key ${cookie.sessionId} due to error: Some error`);
            }
        });
    });

    describe("data storing", () => {
        it("should reset session expiry time and write to cache using session id and encode data before write", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, Arg.any(), "EX", 3600).returns(Promise.resolve("OK"));

            await new SessionStore(redis).store(cookie, data)

            // @ts-ignore
            redis.received().set(cookie.sessionId, Arg.is(encodedDataArg => {
                const decodedSession: ISession = Encoding.decode(encodedDataArg);
                return JSON.stringify(decodedSession[SessionKey.ExtraData]) === JSON.stringify(data[SessionKey.ExtraData])
                    && decodedSession[SessionKey.Expires] != null
                    && decodedSession[SessionKey.Expires] === getSecondsSinceEpoch() + 3600;
            }), "EX", 3600);
        });

        it("should throw error when write failed", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, Arg.any(), "EX", 3600).returns(Promise.reject("Some error"));

            try {
                await new SessionStore(redis).store(cookie, data);
                assert.fail();
            } catch (err) {
                expect(err).to.be.instanceOf(StoringError)
                expect(err.message).to.equal(`Data storing failed for key ${cookie.sessionId} and value ${Encoding.encode(data)} due to error: Some error`);
            }
        });
    });

    describe("deleting storing", () => {
        it("should delete from cache using session id", async () => {
            const redis = Substitute.for<Redis>();
            redis.del(Arg.any()).returns(Promise.resolve(1));

            await new SessionStore(redis).delete(cookie);

            // @ts-ignore
            redis.received().del(cookie.sessionId);
        });

        it("should throw error when delete failed", async () => {
            const redis = Substitute.for<Redis>();
            redis.del(cookie.sessionId).returns(Promise.reject("Some error"));

            try {
                await new SessionStore(redis).delete(cookie);
                assert.fail();
            } catch (err) {
                expect(err).to.be.instanceOf(DeletionError)
                expect(err.message).to.equal(`Data deletion failed for key ${cookie.sessionId} due to error: Some error`);
            }
        });
    });
});
