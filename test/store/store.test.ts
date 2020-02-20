import Substitute, { SubstituteOf, Arg } from "@fluffy-spoon/substitute";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { assert } from "chai";
import { Redis } from "ioredis";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Cookie } from "../../src/session/model/Cookie";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { Response } from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

describe("Store", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should return valid session from cache", async () => {

        const mockResponse: SubstituteOf<Response> = Substitute.for<Response>();


        const verifiedSession: Session = new Session(createNewVerifiedSession(config).data);

        const redis = Substitute.for<Redis>();
        const encodedVerifiedSession = Encoding.encode(verifiedSession.data);
        const promiseEncodedReturnValue = Promise.resolve(encodedVerifiedSession);
        redis.get(Arg.any()).returns(promiseEncodedReturnValue);
        const store = new SessionStore(redis);

        await store.load(Arg.any())
            .map(_ => assert.equal(_, encodedVerifiedSession))
            .run();


        const validCookie = Cookie.newCookie(config.cookieSecret);

        const valueFromStore = await store.load(validCookie).run();

        valueFromStore
            .chain(Session.createInstance)
            .chain(session => session.verify())
            .either(fail => {
                fail.errorFunction(mockResponse);
                assert.fail("failure", "a valid session");
            }, session => assert.equal(session.data[SessionKey.Id],
                (verifiedSession as VerifiedSession).data[SessionKey.Id]));


    });

    it("should encode and decode to the same data from cache", () => {
        const object = {
            name: "tester",
            age: 21
        };

        const redis = Substitute.for<Redis>();
        redis.get(Arg.any()).returns(Promise.resolve(Encoding.encode(object)));

        const store = new SessionStore(redis);
        store.load(Arg.any()).map(_ => assert.deepEqual(_, object));

        const session = new Session(object)
        redis.get(Arg.any()).returns(Promise.resolve(Encoding.encode(session)));
        store.load(Arg.any()).map(_ => assert.deepEqual(_, session));

    });
});
