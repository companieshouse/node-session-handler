"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionKeys_1 = require("./SessionKeys");
const Encoding_1 = require("../encoding/Encoding");
const EitherUtils_1 = require("../utils/EitherUtils");
class SessionStore {
    constructor(cache) {
        this.cache = cache;
        this.load = (cookie) => {
            const decodeSession = EitherUtils_1.liftFunctionToAsyncEither(Encoding_1.Encoding.decodeSession);
            return EitherUtils_1.liftToAsyncEither(cookie)
                .chain(this.cache.get)
                .chain(decodeSession)
                .chain(session => EitherUtils_1.liftEitherToAsyncEither(session.verify()));
        };
        this.store = (session) => {
            const encodedSessionData = Encoding_1.Encoding.encodeSession(session);
            return this.cache.set(session.data[SessionKeys_1.SessionKeys.Id], encodedSessionData);
        };
    }
    getAccessTokenData(session) {
        const rawAccessTokenData = session.data[SessionKeys_1.SessionKeys.SignInInfo];
        return rawAccessTokenData ? rawAccessTokenData[SessionKeys_1.SessionKeys.AccessToken] : undefined;
    }
}
exports.SessionStore = SessionStore;
//# sourceMappingURL=SessionStore.js.map