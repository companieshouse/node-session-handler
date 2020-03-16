import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { expect } from "chai";
import { Session } from "../../src/session/model/Session";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";

describe("Session", () => {
    const cookieSecret = generateRandomBytesBase64(16);

    describe("Session extra data", () => {
        const car = {
            wheels: 4
        };
        const data = {
            test: "developer",
            car
        };
        it("should get an existing value in extra data", () => {
            const session = createNewVerifiedSession(cookieSecret);

            session.data[SessionKey.ExtraData] = data;
            expect(session.getExtraData("test")).to.eq("developer");
            expect(session.getExtraData("car")).to.deep.eq(car);

        });
        it("should set a value into extra data", () => {
            const session = createNewVerifiedSession(cookieSecret);
            session.saveExtraData("data", data);
            expect(session.getExtraData("data")).to.deep.eq(data);
            expect(session.data[SessionKey.ExtraData]).to.deep.eq({ data });

        });
        it("should delete a key/val pair from extra data", () => {
            const session = createNewVerifiedSession(cookieSecret);
            session.data[SessionKey.ExtraData] = data;

            expect(session.deleteExtraData("test")).to.eq(true);
            expect(session.data[SessionKey.ExtraData]).to.deep.eq({ car })
        })
    });

    describe("session verification", () => {
        it("should pass and create verified session", () => {
            const session = createNewVerifiedSession(cookieSecret);
            expect(() => session.verify()).to.not.throw();
        });

        it("should fail when sign in info is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo];

            expect(() => session.verify()).to.throw();
        });

        it("should fail when access token is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.SignInInfo][SignInInfoKeys.AccessToken];

            expect(() => session.verify()).to.throw();
        });

        it("should fail when expiration time is missing", () => {
            const session = createNewVerifiedSession(cookieSecret);
            delete session.data[SessionKey.Expires];
            expect(() => session.verify()).to.throw();
        });

        it("should fail when expiration time elapsed", () => {
            const session = createNewVerifiedSession(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) / 1000 - 1;
            session.data[SessionKey.Expires] = accountsPrecisionTime;

            expect(() => session.verify()).to.throw();
        });

        it("should succeed when expiration time is in the future", () => {
            const session = createNewVerifiedSession(cookieSecret);
            const accountsPrecisionTime = Number(Date.now().toPrecision(10)) / 1000 + 1000;
            session.data[SessionKey.Expires] = accountsPrecisionTime;

            expect(() => session.verify()).to.not.throw();
        });
    });
});