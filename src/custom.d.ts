import { Session } from "./session/Session";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}
