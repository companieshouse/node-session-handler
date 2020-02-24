import { Either, Left, Right, Maybe } from "purify-ts";
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
        if (data) {
            this.data = data;
            this.dirty = false;
        }

    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public getValue = <T = ISessionValue>(key: SessionKey): Maybe<T> => {
        return Maybe.fromNullable(this.data[key]);
    };

    public getExtraData = (): Maybe<any> => Maybe.fromNullable(this.data[SessionKey.ExtraData]);

    public saveExtraData = <T>(key: string, value: T): Session => {
        this.dirty = true;
        if (!this.data[SessionKey.ExtraData]) {
            this.data[SessionKey.ExtraData] = {};
        }

        const extraData = this.data[SessionKey.ExtraData];

        extraData[key] = value;

        this.data[SessionKey.ExtraData] = extraData;

        return this;
    };

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

        if (expires <= Date.now()) {
            return Left(
                Failure(SessionExpiredError)
            );
        }

        return Right(new VerifiedSession(session));

    }

}