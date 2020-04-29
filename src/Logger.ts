import { createLogger } from "ch-logging";
import ApplicationLogger from "ch-logging/lib/ApplicationLogger";

let logger: ApplicationLogger;

export const APP_NAME = "node-session-handler";

export function loggerInstance(): ApplicationLogger {
    if (!logger) {
        logger = createLogger(APP_NAME);
    }
    return logger;
}
