import { Either, Left, Right } from "purify-ts";
import { AccessTokenMissingError, ExpiresInMissingError, SessionExpiredError, SignInInfoMissingError } from "../../error/ErrorFunctions";
import { Failure } from "../../error/FailureType";
import { SessionKeys } from "../SessionKeys";
import { AccessToken } from "./AccessToken";
import { IMap } from "./ISignInInfo";
import { SessionId } from "./SessionId";

export abstract class Session {
    protected [SessionKeys.Id]: string;
    protected _data: IMap<any> = {};

    set data(data: IMap<any>) {
        this._data = data;
    }

    get data(): IMap<any> {
        return this._data;
    }

    public unmarshall(): any {

        const obj: any = {};
        const thisObj: any = this._data;
        obj[SessionKeys.Id] = this[SessionKeys.Id];
        const keys = Object.keys(thisObj).sort()
        for (const i in keys) {
            if (thisObj.hasOwnProperty(keys[i])) {
                obj[keys[i]] = thisObj[keys[i]];

            }
        }

        return obj;
    }

}


export class UnverifiedSession extends Session {

    private constructor(data: any, id?: SessionId, ) {
        super();
        if (id) {
            this[SessionKeys.Id] = id.value;
        } else {
            this[SessionKeys.Id] = data[SessionKeys.Id];
        }
        const keys = Object.keys(data).sort()

        for (const i in keys) {
            if (data.hasOwnProperty(keys[i]) && keys[i] !== SessionKeys.Id) {
                this._data[keys[i]] = data[keys[i]];
            }
        }
    }


    public static async newSession(): Promise<UnverifiedSession> {
        const signInInfo = {
            [SessionKeys.AccessToken]: AccessToken.createDefaultAccessToken()
        }
        return new UnverifiedSession({
            [SessionKeys.Id]: await SessionId.randomSessionId(),
            [SessionKeys.SignInInfo]: signInInfo
        });
    }

    public static async newSessionWithData(data: any): Promise<UnverifiedSession> {
        return new UnverifiedSession(data, await SessionId.randomSessionId());
    }

    public static parseSession(data: any): UnverifiedSession {
        return new UnverifiedSession(data);
    }

}

export class VerifiedSession extends Session {

    private constructor(session: UnverifiedSession) {
        super();
        this[SessionKeys.Id] = session[SessionKeys.Id];
        this._data = session.data;
    }

    public static createValidSession(session: UnverifiedSession): Either<Failure, VerifiedSession> {

        return this.isSessionValid(session).map(success => new VerifiedSession(success));

    }

    public static isSessionValid(session: UnverifiedSession): Either<Failure, UnverifiedSession> {

        const signInInfo = session.data[SessionKeys.SignInInfo];

        if (!signInInfo) {
            return Left(
                Failure(SignInInfoMissingError)
            );
        }

        const accessToken = signInInfo[SessionKeys.AccessToken];

        if (!accessToken) {
            return Left(
                Failure(AccessTokenMissingError)
            );
        }

        const expiresIn = accessToken[SessionKeys.ExpiresIn];

        if (!expiresIn) {
            return Left(
                Failure(ExpiresInMissingError)
            );
        }

        if (expiresIn <= Date.now()) {
            return Left(
                Failure(SessionExpiredError)
            );
        }

        return Right(session);

    }

}
