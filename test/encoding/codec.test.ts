import { Encoding } from "../../src/encoding/Encoding";
import { assert, expect } from "chai";
import Substitute, { Arg } from "@fluffy-spoon/substitute";
import { wrapValue } from "../../src/utils/EitherAsyncUtils";
import { SessionStore } from "../../src/session/SessionStore";
import { Session } from "../../src/session/model/Session";
import { Redis } from "ioredis";

describe("Coding and Deconding test", () => {
    const object = {
        name: "tester",
        age: 21
    };
    it("should encode and decode to the same data", () => {

        const encoded = Encoding.encode(object);
        const decoded = Encoding.decode(encoded)
        assert.deepEqual(decoded, object);

    });
    it("should marshall and unmarshall session object correctly", () => {

        const rawData = {
            a: "a",
            b: "b",
            c: "c"
        };

        const parsedSession = new Session(rawData);

        expect(parsedSession.data).to.not.equal(undefined);
        assert.deepEqual(parsedSession.data as any, rawData);

    });
    it("should encode and decode to the same data from cache", () => {

        const redis = Substitute.for<Redis>();
        redis.get(Arg.any()).returns(Promise.resolve(Encoding.encode(object)));

        const store = new SessionStore(redis);
        store.load(Arg.any()).map(_ => assert.deepEqual(_, object));

        const session = new Session(object)
        redis.get(Arg.any()).returns(Promise.resolve(Encoding.encode(session)));
        store.load(Arg.any()).map(_ => assert.deepEqual(_, session));

    });

});