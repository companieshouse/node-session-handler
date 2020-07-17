"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecondsSinceEpoch = void 0;
function getSecondsSinceEpoch() {
    return Math.round(new Date().getTime() / 1000);
}
exports.getSecondsSinceEpoch = getSecondsSinceEpoch;
//# sourceMappingURL=TimeUtils.js.map