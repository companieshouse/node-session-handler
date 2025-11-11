"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecondsSinceEpoch = getSecondsSinceEpoch;
function getSecondsSinceEpoch() {
    return Math.round(new Date().getTime() / 1000);
}
//# sourceMappingURL=TimeUtils.js.map