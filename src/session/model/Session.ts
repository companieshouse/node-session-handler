import {
    AccessTokenMissingError,
    ExpiresMissingError,
    SessionExpiredError,
    SessionParseError,
    SignInInfoMissingError
} from "../../error/ErrorFunctions";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Either, Left, Maybe, Right } from "purify-ts";
import { ISession, ISessionValue } from "./SessionInterfaces";

import { AccessTokenKeys } from "../keys/AccessTokenKeys";
import { Failure } from "../../error/FailureType";
import { SessionKey } from "../keys/SessionKey";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";

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
