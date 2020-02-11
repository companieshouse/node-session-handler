import { Session } from "./Session";

declare global {
    namespace Express {
        export interface Request {
            session?: Session
        }
    }
}
