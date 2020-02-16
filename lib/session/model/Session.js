"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const FailureType_1 = require("../../error/FailureType");
const SessionKeys_1 = require("../SessionKeys");
const AccessToken_1 = require("./AccessToken");
const Cookie_1 = require("./Cookie");
class Session {
    constructor(data) {
        this.data = {};
        if (data) {
            Session.marshall(this, data);
        }
    }
    unmarshall() {
        const obj = {};
        const thisObj = this.data;
        const keys = Object.keys(thisObj).sort();
        for (const i in keys) {
            if (thisObj.hasOwnProperty(keys[i])) {
                obj[keys[i]] = thisObj[keys[i]];
            }
        }
        return obj;
    }
    verify() {
        return VerifiedSession.verifySession(this);
    }
    static marshall(session, data) {
        const keys = Object.keys(data).sort();
        for (const i in keys) {
            if (data.hasOwnProperty(keys[i])) {
                session.data[keys[i]] = data[keys[i]];
            }
        }
    }
}
exports.Session = Session;
class VerifiedSession extends Session {
    constructor(session) {
        super();
        this.data = session.data;
    }
    asCookie() {
        return Cookie_1.Cookie.sessionCookie(this);
    }
    static createNewVerifiedSession(config, extraData) {
        const newCookie = Cookie_1.Cookie.newCookie(config.cookieSecret);
        const signInInfo = {
            [SessionKeys_1.SessionKeys.AccessToken]: AccessToken_1.AccessToken.createDefaultAccessToken(config.defaultSessionExpiration),
            [SessionKeys_1.SessionKeys.SignedIn]: 0
        };
        const sessionData = !extraData ? {} : extraData;
        sessionData[SessionKeys_1.SessionKeys.Id] = newCookie.sessionId;
        sessionData[SessionKeys_1.SessionKeys.ClientSig] = newCookie.signature;
        sessionData[SessionKeys_1.SessionKeys.SignInInfo] = signInInfo;
        return new VerifiedSession(new Session(sessionData));
    }
    static verifySession(session) {
        const signInInfo = session.data[SessionKeys_1.SessionKeys.SignInInfo];
        if (!signInInfo) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SignInInfoMissingError));
        }
        const accessToken = signInInfo[SessionKeys_1.SessionKeys.AccessToken];
        if (!accessToken) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.AccessTokenMissingError));
        }
        const expires = session.data[SessionKeys_1.SessionKeys.Expires];
        if (!expires) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.ExpiresMissingError));
        }
        if (expires <= Date.now()) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionExpiredError));
        }
        return purify_ts_1.Right(new VerifiedSession(session));
    }
}
exports.VerifiedSession = VerifiedSession;
//# sourceMappingURL=Session.js.map