"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const FailureType_1 = require("../../error/FailureType");
const SessionKey_1 = require("../keys/SessionKey");
const SignInInfoKeys_1 = require("../keys/SignInInfoKeys");
const AccessTokenKeys_1 = require("../keys/AccessTokenKeys");
class Session {
    constructor(data) {
        this.data = {};
        this.verify = () => {
            return VerifiedSession.verifySession(this);
        };
        this.setDirty(true);
        data ? this.setSessionData(data) : this.setSessionData({});
    }
    setSessionData(data) {
        this.data = data;
        if (!data[SessionKey_1.SessionKey.ExtraData]) {
            data[SessionKey_1.SessionKey.ExtraData] = {};
        }
    }
    isDirty() {
        return this.dirty;
    }
    setDirty(dirty) {
        this.dirty = dirty;
    }
    get(key) {
        return this.data[key];
    }
    getExtraData(key) {
        return this.data[SessionKey_1.SessionKey.ExtraData][key];
    }
    saveExtraData(key, val) {
        this.data[SessionKey_1.SessionKey.ExtraData][key] = val;
    }
    deleteExtraData(key) {
        return delete this.data[SessionKey_1.SessionKey.ExtraData][key];
    }
}
exports.Session = Session;
Session.createInstance = (object) => {
    if (object) {
        return purify_ts_1.Right(new Session(object));
    }
    return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionParseError(object)));
};
class VerifiedSession extends Session {
    constructor(session) {
        super();
        this.data = session.data;
    }
    static verifySession(session) {
        const signInInfo = session.data[SessionKey_1.SessionKey.SignInInfo];
        if (!signInInfo) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SignInInfoMissingError));
        }
        const accessToken = signInInfo[SignInInfoKeys_1.SignInInfoKeys.AccessToken];
        if (!accessToken || !accessToken[AccessTokenKeys_1.AccessTokenKeys.AccessToken]) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.AccessTokenMissingError));
        }
        const expires = session.data[SessionKey_1.SessionKey.Expires];
        if (!expires) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.ExpiresMissingError));
        }
        // This time corresponds to the time precisison given by the accounts service in seconds.
        const dateNowMillis = Number(Date.now().toPrecision(10)) / 1000;
        if (expires <= dateNowMillis) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionExpiredError(`Expires: ${expires}`, `Actual: ${dateNowMillis}`)));
        }
        return purify_ts_1.Right(new VerifiedSession(session));
    }
}
exports.VerifiedSession = VerifiedSession;
//# sourceMappingURL=Session.js.map