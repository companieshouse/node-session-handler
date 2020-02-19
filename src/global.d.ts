import { Session } from "./session/model/Session";
import { Cookie } from './session/model/Cookie';
import { Maybe } from 'purify-ts';

declare global {
    namespace Express {
        export interface Request {
            session: Maybe<Session>;
        }
    }
}