import { Either, Left, Right } from "purify-ts";
import {
    AccessTokenMissingError,
    ExpiresMissingError,
    SessionExpiredError,
    SignInInfoMissingError,
    SessionParseError as SessionCreationError
} from "../../error/ErrorFunctions";
import { Failure } from "../../error/FailureType";
import { SessionKey } from "../keys/SessionKey";
import { Cookie } from "./Cookie";
import { Encoding } from "../../encoding/Encoding";
import { ISession, ISessionValue, ISignInInfo } from "./SessionInterfaces";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";

export class Session {

    private isDirty: boolean;
    public data: ISession = {};

    public constructor(data?: any) {

        if (data) {

            this.data = data;
            this.isDirty = false;
        }

    }

    public getValue = <T = ISessionValue>(key: SessionKey): T => {
        return this.data[key];
    };

    public getExtraData = (): any => this.data[SessionKey.ExtraData];

    public saveExtraData = <T>(key: string, value: T): void => {
        this.isDirty = true;
        if (!this.data[SessionKey.ExtraData]) {
            this.data[SessionKey.ExtraData] = {};
        }

        const extraData = this.data[SessionKey.ExtraData];

        extraData[key] = value;

        this.data[SessionKey.ExtraData] = extraData;

    };

    public verify = (): Either<Failure, VerifiedSession> => {
        return VerifiedSession.verifySession(this);
    };

    public static createInstance = (object: any): Either<Failure, Session> => {
        if (object) {
            return Right(new Session(object));
        }
        return Left(Failure(SessionCreationError(object)));
    };
}

export class VerifiedSession extends Session {

    private constructor(session: Session) {
        super();
        this.data = session.data;
    }

    public static verifySession(session: Session): Either<Failure, VerifiedSession> {

        const signInInfo = session.getValue<ISignInInfo>(SessionKey.SignInInfo);

        if (!signInInfo) {
            return Left(
                Failure(SignInInfoMissingError)
            );
        }

        const accessToken = signInInfo[SignInInfoKeys.AccessToken];

        if (!accessToken) {
            return Left(
                Failure(AccessTokenMissingError)
            );
        }

        const expires = session.getValue<number>(SessionKey.Expires);

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


