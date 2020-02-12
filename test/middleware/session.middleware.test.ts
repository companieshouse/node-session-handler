import { expect } from "chai";
import { Substitute } from "@fluffy-spoon/substitute";
import { SessionStore } from "../../src/session/SessionStore";
import { Session } from "../../src/session/Session";
import { Request } from "express";
import { Encoding } from "../../src/encoding/Encoding";

describe("Session Middleware", () => {
    const sessionData = {
        test: "this is a test"
    };
    it("should create a new id for the session", async () => {
        const validSession = new Session("", sessionData);
        const validEncodedSession = await Encoding.encodeSession(validSession);
        const decodedSession = await Encoding.decodeSession<Session>(validEncodedSession);
        expect(decodedSession.id).not.equals("");

    });

    it("should call next if the request contains a valid session ID", async () => {
        // This should generate an id.
        const validSession = new Session(await Encoding.generateSessionId(), sessionData);

        const middleware = Substitute.for<
        const sessionStore = Substitute.for<SessionStore>();
        const request = Substitute.for<Request>();
        request.cookies.__SID = validSession.id;

        sessionStore.load(validSession.id).returns(new Promise((resolve, reject) => resolve(validSession)));
        request
        
    });
});