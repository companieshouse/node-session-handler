import { expect } from "chai";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";
import { Session } from "../../src/session/model/Session";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { createSession } from "../utils/SessionGenerator";

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
            const session = createSession(cookieSecret);
            session.data[SessionKey.ExtraData] = { application: data };

            expect(session.getExtraData("application")).to.deep.equal(data);
        });

        it("should set a value into extra data", () => {
            const session = createSession(cookieSecret);

            session.setExtraData("application", data);
            expect(session.data[SessionKey.ExtraData]).to.deep.equal({ application: data });

        });

        it("should delete a key/val pair from extra data", () => {
            const session = createSession(cookieSecret);
            session.data[SessionKey.ExtraData] = { application: data };

            expect(session.deleteExtraData("application")).to.equal(true);
            expect(session.data[SessionKey.ExtraData]).to.deep.equal({ })
        })
    });

    describe("session verification", () => {
        it("should pass and create verified session", () => {
            expect(() => createSession(cookieSecret).verify()).to.not.throw();
        });

        it("should fail when sign in info is missing", () => {
            const session = createSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo];

            expect(() => session.verify()).to.throw("Session data is incomplete - signin_info property is missing");
        });

        it("should fail when access token is missing", () => {
            const session = createSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo][SignInInfoKeys.AccessToken];

            expect(() => session.verify()).to.throw("Session data is incomplete - signin_info.access_token property is missing");
        });

        it("should fail when expiration time is missing", () => {
            const session = createSession(cookieSecret);
            delete session.data[SessionKey.Expires];

            expect(() => session.verify()).to.throw("Session data is incomplete - expires property is missing");
        });

        it("should fail when expiration time elapsed", () => {
            const session = createSession(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) / 1000 - 1;
            session.data[SessionKey.Expires] = accountsPrecisionTime;

            expect(() => session.verify()).to.throw(`Session expired at ${accountsPrecisionTime} (since UNIX epoch) while current time is`);
        });

        it("should succeed when expiration time is in the future", () => {
            const session = createSession(cookieSecret);
            session.data[SessionKey.Expires] = Number(Date.now().toPrecision(10)) / 1000 + 1000;

            expect(() => session.verify()).to.not.throw();
        });
    });
});
