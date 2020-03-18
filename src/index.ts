import { Session, VerifiedSession } from "./session/model/Session";
import { ISession } from "./session/model/SessionInterfaces";
import { SessionStore } from "./session/store/SessionStore";
import { SessionMiddleware } from "./session/SessionMiddleware";
import { CookieConfig } from "./config/CookieConfig";
import * as EitherUtils from "./utils/EitherAsyncUtils";
import { Maybe, Either } from "purify-ts";
declare global {
    namespace Express {
        export interface Request {
            session: Maybe<Session>;
        }
    }
}
export { Session, VerifiedSession, ISession, SessionStore, SessionMiddleware, CookieConfig, EitherUtils, Maybe, Either };
