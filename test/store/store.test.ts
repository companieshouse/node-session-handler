import Substitute, { SubstituteOf, Arg } from "@fluffy-spoon/substitute";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { assert, expect } from "chai";
import { Redis } from "ioredis";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Cookie } from "../../src/session/model/Cookie";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { Response } from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Either } from "purify-ts";
import { Failure } from "../../src/error/FailureType";

describe("Store", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should create a verified session and it stays verified after encoding and decoding", () => {
        const validSession: VerifiedSession = createNewVerifiedSession(config);

        Either.of<Failure, any>(validSession.data)
            .map(Encoding.encode)
            .map(Encoding.decode)
            .chain(Session.createInstance)
            .map(decoded => {
                expect(decoded.verify().isRight()).to.equals(true);
                expect(decoded.data).to.deep.equals(validSession.data);

            });


    });
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
    it("Should return Nothing when trying to access a newly created session", () => {
        const session = createNewVerifiedSession(config);

        expect(session.getExtraData().isNothing()).to.eq(true);

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
