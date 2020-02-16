import { Session } from "./session/model/Session";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}