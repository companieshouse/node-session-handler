"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionErrors_1 = require("./SessionErrors");
const SessionKey_1 = require("../keys/SessionKey");
const SignInInfoKeys_1 = require("../keys/SignInInfoKeys");
const AccessTokenKeys_1 = require("../keys/AccessTokenKeys");
const Logger_1 = require("../../Logger");
class Session {
    constructor(data = {}) {
        this.data = data;
        this.verify = () => {
            const signInInfo = this.data[SessionKey_1.SessionKey.SignInInfo];
            if (!signInInfo) {
                throw new SessionErrors_1.IncompleteSessionDataError(SessionKey_1.SessionKey.SignInInfo);
            }
            const accessToken = signInInfo[SignInInfoKeys_1.SignInInfoKeys.AccessToken];
            if (!accessToken || !accessToken[AccessTokenKeys_1.AccessTokenKeys.AccessToken]) {
                throw new SessionErrors_1.IncompleteSessionDataError(SessionKey_1.SessionKey.SignInInfo, SignInInfoKeys_1.SignInInfoKeys.AccessToken);
            }
            const expires = this.data[SessionKey_1.SessionKey.Expires];
            if (!expires) {
                throw new SessionErrors_1.IncompleteSessionDataError(SessionKey_1.SessionKey.Expires);
            }
            // This time corresponds to the time precision given by the accounts service in seconds.
            const dateNowMilliseconds = Number(Date.now().toPrecision(10)) / 1000;
            if (expires <= dateNowMilliseconds) {
                throw new SessionErrors_1.SessionExpiredError(expires, dateNowMilliseconds);
            }
            Logger_1.loggerInstance().debug("Session Verified");
        };
        if (this.data[SessionKey_1.SessionKey.ExtraData] == null) {
            // @ts-ignore - ignores read only flag to initiate extra data
            this.data[SessionKey_1.SessionKey.ExtraData] = {};
        }
    }
    get(key) {
        return this.data[key];
    }
    getExtraData(key) {
        return this.data[SessionKey_1.SessionKey.ExtraData][key];
    }
    setExtraData(key, value) {
        this.data[SessionKey_1.SessionKey.ExtraData][key] = value;
    }
    deleteExtraData(key) {
        return delete this.data[SessionKey_1.SessionKey.ExtraData][key];
    }
}
exports.Session = Session;
//# sourceMappingURL=Session.js.map