import { Either, Left, Right } from "purify-ts";
import { AccessTokenMissingError, ExpiresMissingError, SessionExpiredError, SignInInfoMissingError } from "../../error/ErrorFunctions";
import { Failure } from "../../error/FailureType";
import { SessionKeys } from "../SessionKeys";
import { AccessToken } from "./AccessToken";
import { IMap } from "./ISignInInfo";
import { Cookie } from "./Cookie";
import { SessionHandlerConfig } from "../../SessionHandlerConfig";

export class Session {

    public data: IMap<any> = {};

    public constructor(data?: any) {

        if (data) {

            Session.marshall(this, data);
        }

    }

    public unmarshall(): any {

        const obj: any = {};
        const thisObj: any = this.data;

        const keys = Object.keys(thisObj).sort();
        for (const i in keys) {
            if (thisObj.hasOwnProperty(keys[i])) {
                obj[keys[i]] = thisObj[keys[i]];

            }
        }

        return obj;
    }

    public verify(): Either<Failure, VerifiedSession> {
        return VerifiedSession.verifySession(this);
    }

    public static marshall(session: Session, data: any): void {
        const keys = Object.keys(data).sort();

        for (const i in keys) {
            if (data.hasOwnProperty(keys[i])) {
                session.data[keys[i]] = data[keys[i]];
            }
        }
    }

}

export class VerifiedSession extends Session {

    private constructor(session: Session) {
        super();
        this.data = session.data;
    }

    public asCookie(): Cookie {
        return Cookie.sessionCookie(this);
    }

    public static createNewVerifiedSession(
        config: SessionHandlerConfig,
        extraData?: any): VerifiedSession {

        const newCookie: Cookie = Cookie.newCookie(config.cookieSecret);

        const signInInfo = {
            [SessionKeys.AccessToken]: AccessToken.createDefaultAccessToken(config.defaultSessionExpiration),
            [SessionKeys.SignedIn]: 0
        };

        const sessionData = !extraData ? {} : extraData;

        sessionData[SessionKeys.Id] = newCookie.sessionId;
        sessionData[SessionKeys.ClientSig] = newCookie.signature;
        sessionData[SessionKeys.SignInInfo] = signInInfo;

        return new VerifiedSession(new Session(sessionData));
    }

    public static verifySession(session: Session): Either<Failure, VerifiedSession> {

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

        const expires = session.data[SessionKeys.Expires];

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
