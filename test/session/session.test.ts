import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { expect } from "chai";
import { Session } from "../../src/session/model/Session";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";

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
            session.data[SessionKey.Expires] = 1;

            expect(session.verify().isLeft()).to.equal(true);
        });
    });
});
