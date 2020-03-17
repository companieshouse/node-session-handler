import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";
import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { expect } from "chai";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

describe("Session", () => {
    const cookieSecret = generateRandomBytesBase64(16);

    describe("saving extra data", () => {
        const key = "test";
        const obj = {
            a: "a",
            b: "b"
        };

        it("should should allow retrieving saved data in unchanged form", () => {
            const session = createNewVerifiedSession(cookieSecret);
            session.saveExtraData(key, obj);

            expect(session.getExtraData().isJust()).to.eq(true);
            session.getExtraData().map(data => expect(data[key]).to.deep.equal(obj));
        });

        it("should set the dirty flag to true after saving extra data", () => {
            const session = createNewVerifiedSession(cookieSecret);
            session.saveExtraData(key, obj);

            expect(session.isDirty()).to.eq(true);
        });
    });

    describe("session verification", () => {
        it("should pass and create verified session", () => {
            const session = createNewVerifiedSession(cookieSecret);
            expect(session.verify().isRight()).equals(true);
        });

        it("should fail when sign in info is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo];

            expect(session.verify().isLeft()).to.equal(true);
        });

        it("should fail when access token is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo][SignInInfoKeys.AccessToken];

            expect(session.verify().isLeft()).to.equal(true);
        });

        it("should fail when expiration time is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.Expires];

            expect(session.verify().isLeft()).to.equal(true);
        });

        it("should fail when expiration time elapsed", () => {
            const session = createNewVerifiedSession(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) / 1000 - 1;
            session.data[SessionKey.Expires] = accountsPrecisionTime;

            expect(session.verify().isLeft()).to.equal(true);
        });

        it("should succeed when expiration time is in the future", () => {
            const session = createNewVerifiedSession(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) + 1000;
            session.data[SessionKey.Expires] = accountsPrecisionTime;

            expect(session.verify().isRight()).to.equal(true);
        });
    });
});
