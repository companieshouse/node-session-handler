"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_NAME = void 0;
exports.loggerInstance = loggerInstance;
const structured_logging_node_1 = require("@companieshouse/structured-logging-node");
let logger;
exports.APP_NAME = "node-session-handler";
function loggerInstance() {
    if (!logger) {
        logger = (0, structured_logging_node_1.createLogger)(exports.APP_NAME);
    }
    return logger;
}
//# sourceMappingURL=Logger.js.map