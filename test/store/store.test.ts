import { assert, expect } from "chai";
import { Substitute, Arg } from "@fluffy-spoon/substitute";
import { Redis } from "ioredis";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Cookie } from "../../src/session/model/Cookie";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Encoding } from "../../src/encoding/Encoding";

type Data = Record<string, any>

describe("Store", () => {
    const cookie = Cookie.create(generateRandomBytesBase64(16));
    const data: Data = {
        name: "Mark",
        age: 18
    };
    const encodedData = Encoding.encode(data);

    describe("data loading", () => {
        it("should read from cache using session id and decode data after read", async () => {
            const redis = Substitute.for<Redis>();
            redis.get(cookie.sessionId).returns(Promise.resolve(encodedData));

            const result = await new SessionStore(redis).load<Data>(cookie).run();
            result.either(
                _ => assert.fail(),
                response => expect(response).to.be.deep.equal(data)
            );

            redis.received().get(cookie.sessionId);
        });

        it("should return failure when read failed", async () => {
            const redis = Substitute.for<Redis>();
            redis.get(cookie.sessionId).returns(Promise.reject("Some error"));

            const result = await new SessionStore(redis).load<Data>(cookie).run();
            expect(result.isLeft()).to.equal(true);
        });
    });

    describe("data storing", () => {
        it("should write to cache using session id and encode data before write", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, encodedData).returns(Promise.resolve("OK"));

            const result = await new SessionStore(redis).store<Data>(cookie, data).run();
            result.either(
                _ => assert.fail(),
                response => expect(response).to.be.equal("OK")
            );

            // @ts-ignore
            redis.received().set(cookie.sessionId, Arg.any());
        });

        it("should return failure when write failed", async () => {
            const redis = Substitute.for<Redis>();
            // @ts-ignore
            redis.set(cookie.sessionId, encodedData).returns(Promise.reject("Some error"));

            const result = await new SessionStore(redis).store<Data>(cookie, data).run();
            expect(result.isLeft()).to.equal(true);
        });
    });

    describe("deleting storing", () => {
        it("should delete from cache using session id", async () => {
            const redis = Substitute.for<Redis>();
            redis.del(Arg.any()).returns(Promise.resolve(1));

            const result = await new SessionStore(redis).delete(cookie).run();
            result.either(
                _ => assert.fail(),
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
        })
    })
});
