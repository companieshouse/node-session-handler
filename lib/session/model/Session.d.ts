import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
export declare class Session {
    private isDirty;
    data: ISession;
    constructor(data?: any);
    getValue: <T = ISessionValue>(key: SessionKey) => T;
    getExtraData: () => any;
    saveExtraData: <T>(key: string, value: T) => void;
    verify: () => Either<Failure, VerifiedSession>;
    static createInstance: (object: any) => Either<Failure, Session>;
}
export declare class VerifiedSession extends Session {
    private constructor();
    static verifySession(session: Session): Either<Failure, VerifiedSession>;
}
