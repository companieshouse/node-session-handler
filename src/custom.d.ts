import Session = require("./session/Session");

declare global {
    namespace Express {
        export interface Request {
            session?: Session
        }
    }
}
