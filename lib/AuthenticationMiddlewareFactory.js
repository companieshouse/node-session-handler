"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionKeys_1 = require("./session/SessionKeys");
exports.createAuthenticationMiddleware = (redirectFn) => (request, response, next) => {
    var _a;
    if (!request.session || !((_a = request.session.data[SessionKeys_1.SessionKeys.SignInInfo]) === null || _a === void 0 ? void 0 : _a.signedIn)) {
        redirectFn(response);
    }
    next();
};
//# sourceMappingURL=AuthenticationMiddlewareFactory.js.map