"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ch_logging_1 = require("ch-logging");
let logger;
exports.APP_NAME = 'node-session-handler';
function loggerInstance() {
    if (!logger) {
        logger = ch_logging_1.createLogger(exports.APP_NAME);
    }
    return logger;
}
exports.loggerInstance = loggerInstance;
//# sourceMappingURL=Logger.js.map