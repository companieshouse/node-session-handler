import { expect } from "chai";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";
import { Session } from "../../src/session/model/Session";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { createSession, createSessionData } from "../utils/SessionGenerator";

describe("Session", () => {
    const cookieSecret = generateRandomBytesBase64(16);

    describe("Session extra data", () => {
        const reason = {
            description: "Because..."
        };
        const data = {
            state: "incomplete",
            reason
        };

        it("should get an existing value in extra data", () => {
            const session = new Session({ ...createSessionData(cookieSecret), [SessionKey.ExtraData]: { application: data } });

            expect(session.getExtraData("application")).to.deep.equal(data);
        });

        it("should set a value into extra data", () => {
            const session = new Session(createSessionData(cookieSecret));

            session.setExtraData("application", data);
            expect(session.getExtraData("application")).to.deep.equal(data);

        });

        it("should delete a key/val pair from extra data", () => {
            const session = new Session({ ...createSessionData(cookieSecret), [SessionKey.ExtraData]: { application: data } });

            expect(session.deleteExtraData("application")).to.equal(true);
            expect(session.getExtraData("application")).to.be.equal(undefined)
        })
    });

    describe("Session language", () => {
        it("should get language when it exists", () => {
            const session = new Session({ ...createSessionData(cookieSecret), [SessionKey.Lang]: "en" });
            expect(session.getLanguage()).to.equal("en");
        });

        it("should return undefined when language does not exist", () => {
            const session = new Session(createSessionData(cookieSecret));
            expect(session.getLanguage()).to.equal(undefined);
        });

        it("should set language", () => {
            const session = new Session(createSessionData(cookieSecret));
            session.setLanguage("cy");
            expect(session.getLanguage()).to.equal("cy");
        });
    });

    describe("session verification", () => {
        it("should pass and create verified session", () => {
            expect(() => createSession(cookieSecret).verify()).to.not.throw();
        });

        it("should fail when access token is missing", () => {
            const sessionData = createSessionData(cookieSecret);
            sessionData[SessionKey.SignInInfo][SignInInfoKeys.SignedIn]=1;
            delete sessionData[SessionKey.SignInInfo][SignInInfoKeys.AccessToken];

            expect(() => new Session(sessionData).verify()).to.throw("Session data is incomplete - signin_info.access_token property is missing");
        });

        it("should fail when expiration time is missing", () => {
            const sessionData = createSessionData(cookieSecret);
            delete sessionData[SessionKey.Expires];

            expect(() => new Session(sessionData).verify()).to.throw("Session data is incomplete - expires property is missing");
        });

        it("should fail when expiration time elapsed", () => {
            const sessionData = createSessionData(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) / 1000 - 1;
            sessionData[SessionKey.Expires] = accountsPrecisionTime;

            expect(() => new Session(sessionData).verify()).to.throw(`Session expired at ${accountsPrecisionTime} (since UNIX epoch) while current time is`);
        });

        it("should succeed when expiration time is in the future", () => {
            const sessionData = createSessionData(cookieSecret);
            sessionData[SessionKey.Expires] = Number(Date.now().toPrecision(10)) / 1000 + 1000;

            expect(() => new Session(sessionData).verify()).to.not.throw();
        });
    });
});
