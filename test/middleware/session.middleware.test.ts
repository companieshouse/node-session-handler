import { expect, assert } from "chai";
import { SessionKeys } from "../../src/session/SessionKeys";
import { UnverifiedSession, Session, VerifiedSession } from "../../src/session/model/Session";
import { Encoding, EncondingConstant } from "../../src/encoding/Encoding";
import { SessionMiddlerwareFactory } from "../../src/SessionMiddlewareFactory";
import { SessionStore } from "../../src/session/SessionStore";
import { liftEitherToAsyncEither } from "../../src/utils/EitherUtils";
import { Right } from "purify-ts";
import { Substitute, Arg } from "@fluffy-spoon/substitute";
import * as express from "express";
import cookie from "cookie";
import { SessionId } from '../../src/session/model/SessionId';
import config from '../../src/config';

const rawData: any = {
    ".id": "23Ubph8aLFe3sSquJrqoqrg3xnXV",
    ".client.signature": "2e814a2c80285b9d57d25894dca89247a8015d5d",
    ".hijacked": null,
    ".oauth2_nonce": "",
    ".zxs_key": "cea8ef23a3112bb9574ae2471262582c067ea7ebb304675f517071fc584ef929",
    expires: 1580481475,
    last_access: 1580477875,
    pst: "all",
    signin_info: {
        access_token: {
            access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
            expires_in: 3600,
            refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
            token_type: "Bearer"
        },
        admin_permissions: "0",
        signed_in: 1,
        user_profile: {
            email: "demo@ch.gov.uk",
            forename: null,
            id: "Y2VkZWVlMzhlZWFjY2M4MzQ3MT",
            locale: "GB_en",
            surname: null
        }
    }
};

describe("Session Middleware", () => {
    const sessionData = {
        test: "this is a test"
    };
    it("should create a new id for the session", async () => {
        const validSession = await UnverifiedSession.newSession();
        const validEncodedSession = Encoding.encodeSession(validSession);
        const decodedSession = Encoding.decodeSession(validEncodedSession);
        expect(decodedSession[SessionKeys.Id]).not.equals("");

    });
    it("should marshall and unmarshall session object correctly", () => {
        const clientSignature = "2e814a2c80285b9d57d25894dca89247a8015d5d";
        const sessionEncoding = (): UnverifiedSession => {
            return UnverifiedSession.parseSession(rawData);

        };
        const session: UnverifiedSession = sessionEncoding();
        expect(session.data).to.not.equal(undefined);
        expect(session.data[SessionKeys.SignInInfo]).to.not.equal(undefined);
        expect(session.unmarshall()[SessionKeys.ClientSig]).to.equal(clientSignature);

        const unmarshalledValues = session.unmarshall();

        assert.deepEqual(unmarshalledValues, rawData);
    });

    it("should validate the signature correctly", async () => {
        config.session.secret = "this is a secret";
        const mockSessionId = "23Ubph8aLFe3sSquJrqoqrg3xnXV";
        const unverifiedSession = await UnverifiedSession.newSession();
        unverifiedSession[SessionKeys.Id] = mockSessionId;
        unverifiedSession.data[SessionKeys.ClientSig] = "UrFfpIpf4DEbT5KcR8XM8FV/ZxQ=";
    });
    it("should call next if the request contains a valid session ID", async () => {

        const response: express.Response = Substitute.for<express.Response>();

        // Generate valid sessin id, secret and signature.
        const mockSessionId = await Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
        config.session.secret = await Encoding.generateRandomBytesBase64(16);
        const expectedSignature = Encoding.generateSignature(mockSessionId, config.session.secret);
        // Generate Cookie value
        const cookieValue = mockSessionId + expectedSignature;
        // Attempt to validate session id
        const sessionIdEither = SessionId.getValidatedSessionId(cookieValue);
        sessionIdEither.bimap(
            failure => assert.fail(failure.errorFunction(response)),
            r => assert.equal(r.value, mockSessionId));

        const middleware = Substitute.for<SessionMiddlerwareFactory>();
        const sessionStore = Substitute.for<SessionStore>();
        const request: express.Request = Substitute.for<express.Request>();

        const verifiedSession = Substitute.for<VerifiedSession>();

        sessionStore.load(Arg.all()).returns(liftEitherToAsyncEither(Right(verifiedSession)));

        const loadSessionAsyncEither = await liftEitherToAsyncEither(sessionIdEither)
            .chain(validId => sessionStore.load(validId)).run();


        expect(loadSessionAsyncEither.isLeft()).to.equal(false);
        loadSessionAsyncEither.map(v => expect(v).to.equal(verifiedSession));
    });
});