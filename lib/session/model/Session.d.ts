import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { IMap } from "./ISignInInfo";
import { Cookie } from "./Cookie";
import { SessionHandlerConfig } from "../../SessionHandlerConfig";
export declare class Session {
    data: IMap<any>;
    constructor(data?: any);
    unmarshall: () => any;
    verify: () => Either<Failure, VerifiedSession>;
    static marshall: (session: Session, data: any) => void;
}
export declare class VerifiedSession extends Session {
    private constructor();
    asCookie: () => Cookie;
    static createNewVerifiedSession(config: SessionHandlerConfig, extraData?: any): VerifiedSession;
    static verifySession(session: Session): Either<Failure, VerifiedSession>;
}
