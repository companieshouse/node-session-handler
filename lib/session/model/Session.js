"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const SessionErrors_1 = require("./SessionErrors");
const SessionKey_1 = require("../keys/SessionKey");
const SignInInfoKeys_1 = require("../keys/SignInInfoKeys");
const AccessTokenKeys_1 = require("../keys/AccessTokenKeys");
const Logger_1 = require("../../Logger");
class Session {
    constructor(data = {}) {
        this.data = data;
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
    getLanguage() {
        return this.data[SessionKey_1.SessionKey.Lang];
    }
    setLanguage(language) {
        // @ts-ignore - ignores read only flag to set language
        this.data[SessionKey_1.SessionKey.Lang] = language;
    }
    verify() {
        const signInInfo = this.data[SessionKey_1.SessionKey.SignInInfo];
        if (signInInfo) {
            if (signInInfo[SignInInfoKeys_1.SignInInfoKeys.SignedIn] === 1) {
                this.verifySignInInfo(signInInfo);
            }
            else {
                // If the user is not signed in, it's not an error but log the signInInfo to see what is there
                this.logRecordArray(signInInfo, "SignInInfo");
            }
        }
        this.verifyExpiryTime(this.data[SessionKey_1.SessionKey.Expires]);
    }
    ;
    verifySignInInfo(signInInfo) {
        const accessToken = signInInfo[SignInInfoKeys_1.SignInInfoKeys.AccessToken];
        if (!accessToken || !accessToken[AccessTokenKeys_1.AccessTokenKeys.AccessToken]) {
            this.logRecordArray(signInInfo, "SignInInfo");
            throw new SessionErrors_1.IncompleteSessionDataError(SessionKey_1.SessionKey.SignInInfo, SignInInfoKeys_1.SignInInfoKeys.AccessToken);
        }
    }
    verifyExpiryTime(expires) {
        if (!expires) {
            throw new SessionErrors_1.IncompleteSessionDataError(SessionKey_1.SessionKey.Expires);
        }
        // This time corresponds to the time precision given by the accounts service in seconds.
        const dateNowMilliseconds = Number(Date.now().toPrecision(10)) / 1000;
        if (expires <= dateNowMilliseconds) {
            throw new SessionErrors_1.SessionExpiredError(expires, dateNowMilliseconds);
        }
    }
    logRecordArray(recordArray, arrayName = "") {
        for (const [key, value] of Object.entries(recordArray)) {
            if (value && typeof value === "object" && value !== null && !Array.isArray(value)) {
                // If the value is an object, recursively log its entries
                this.logRecordArray(value, key);
            }
            else {
                // Log the key-value pair
                if (typeof key === "string" && key.endsWith("_token")) {
                    (0, Logger_1.loggerInstance)().info(`${arrayName} Key: ${key}, Value: <present>`);
                }
                else {
                    (0, Logger_1.loggerInstance)().info(`${arrayName} Key: ${key}, Value: ${value}`);
                }
            }
        }
    }
}
exports.Session = Session;
//# sourceMappingURL=Session.js.map