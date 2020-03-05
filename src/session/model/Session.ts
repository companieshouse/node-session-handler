import { Either, Left, Right, Maybe, Just } from "purify-ts";
import {
    AccessTokenMissingError,
    ExpiresMissingError,
    SessionExpiredError,
    SignInInfoMissingError,
    SessionParseError
} from "../../error/ErrorFunctions";
import { Failure } from "../../error/FailureType";
import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";
import { AccessTokenKeys } from "../keys/AccessTokenKeys";

export class Session {

    private dirty: boolean;
    public data: ISession = {};

    public constructor(data?: any) {

        this.setDirty(true);
        data ? this.setSessionData(data) : this.setSessionData({});

    }

    public setSessionData(data: ISession): void {
        this.data = data;
        if (!data[SessionKey.ExtraData]) {
            data[SessionKey.ExtraData] = {};
        }
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public setDirty(dirty: boolean): void {
        this.dirty = dirty;
    }

    public get<T = ISessionValue>(key: SessionKey): T | undefined {
        return this.data[key];
    }

    public getExtraData<T>(key: string): T | undefined {
        return this.data[SessionKey.ExtraData][key];
    }

    public saveExtraData<T>(key: string, val: T): void {
        this.data[SessionKey.ExtraData][key] = val;
    }

    public deleteExtraData(key: string): boolean {
        return delete this.data[SessionKey.ExtraData][key];
    }

    public verify = (): Either<Failure, VerifiedSession> => {
        return VerifiedSession.verifySession(this);
    };

    public static createInstance = (object: any): Either<Failure, Session> => {
        if (object) {
            return Right(new Session(object));
        }
        return Left(Failure(SessionParseError(object)));
    };
}

export class VerifiedSession extends Session {

    private constructor(session: Session) {
        super();
        this.data = session.data;
    }

    public static verifySession(session: Session): Either<Failure, VerifiedSession> {

        const signInInfo = session.data[SessionKey.SignInInfo];

        if (!signInInfo) {
            return Left(
                Failure(SignInInfoMissingError)
            );
        }

        const accessToken = signInInfo[SignInInfoKeys.AccessToken];

        if (!accessToken || !accessToken[AccessTokenKeys.AccessToken]) {
            return Left(
                Failure(AccessTokenMissingError)
            );
        }

        const expires = session.data[SessionKey.Expires];

        if (!expires) {
            return Left(
                Failure(ExpiresMissingError)
            );
        }
        // This time corresponds to the time precisison given by the accounts service in seconds.
        const dateNowMillis = Number(Date.now().toPrecision(10)) / 1000;

        if (expires <= dateNowMillis) {
            return Left(
                Failure(SessionExpiredError(`Expires: ${expires}`, `Actual: ${dateNowMillis}`))
            );
        }

        return Right(new VerifiedSession(session));

    }

}
