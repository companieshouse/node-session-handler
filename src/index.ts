import { Session } from "./session/model/Session";
import { ISession } from "./session/model/SessionInterfaces";
import { SessionStore } from "./session/store/SessionStore";
import { SessionMiddleware } from "./session/SessionMiddleware";
import { CookieConfig } from "./config/CookieConfig";


declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}

export { Session, ISession, SessionStore, SessionMiddleware, CookieConfig};
