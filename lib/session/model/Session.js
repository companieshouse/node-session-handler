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
        this.getValue = (key) => {
            return purify_ts_1.Maybe.fromNullable(this.data[key]);
        };
        this.getExtraData = () => purify_ts_1.Maybe.fromNullable(this.data[SessionKey_1.SessionKey.ExtraData]);
        this.saveExtraData = (key, value) => {
            this.dirty = true;
            if (!this.data[SessionKey_1.SessionKey.ExtraData]) {
                this.data[SessionKey_1.SessionKey.ExtraData] = {};
            }
            const extraData = this.data[SessionKey_1.SessionKey.ExtraData];
            extraData[key] = value;
            this.data[SessionKey_1.SessionKey.ExtraData] = extraData;
            return this;
        };
        this.verify = () => {
            return VerifiedSession.verifySession(this);
        };
        if (data) {
            this.data = data;
            this.dirty = false;
        }
    }
    isDirty() {
        return this.dirty;
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
        // This time corresponds to the time precisison given by the accounts service in millis.
        // 1sec = 1000ms;
        const dateNowMillis = Number(Date.now().toPrecision(10));
        if (expires <= dateNowMillis) {
            return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionExpiredError(`Expires: ${expires}`, `Actual: ${dateNowMillis}`)));
        }
        return purify_ts_1.Right(new VerifiedSession(session));
    }
}
exports.VerifiedSession = VerifiedSession;
//# sourceMappingURL=Session.js.map