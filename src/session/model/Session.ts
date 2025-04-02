import { IncompleteSessionDataError, SessionExpiredError } from "./SessionErrors";
import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";
import { AccessTokenKeys } from "../keys/AccessTokenKeys";
import { loggerInstance } from "../../Logger";

export class Session {

    public constructor(public data: Readonly<ISession> = {}) {
        if (this.data[SessionKey.ExtraData] == null) {
            // @ts-ignore - ignores read only flag to initiate extra data
            this.data[SessionKey.ExtraData] = {}
        }
    }

    public get<T = ISessionValue>(key: SessionKey): T | undefined {
        return this.data[key];
    }

    public getExtraData<T>(key: string): T | undefined {
        return this.data[SessionKey.ExtraData][key];
    }

    public setExtraData<T>(key: string, value: T): void {
        this.data[SessionKey.ExtraData][key] = value;
    }

    public deleteExtraData(key: string): boolean {
        return delete this.data[SessionKey.ExtraData][key];
    }

    public verify (): void {
        if (this.data[SessionKey.SignInInfo]) {
            this.verifySignInInfo(this.data[SessionKey.SignInInfo]);
        }

        this.verifyExpiryTime(this.data[SessionKey.Expires]);
    };

    private verifySignInInfo(signInInfo: Record<string, any>): void {
        const accessToken = signInInfo[SignInInfoKeys.AccessToken];
        loggerInstance().info(`Signin Info: ${signInInfo}`);
        if (!accessToken || !accessToken[AccessTokenKeys.AccessToken]) {
            throw new IncompleteSessionDataError(SessionKey.SignInInfo, SignInInfoKeys.AccessToken);
        }
    }

    private verifyExpiryTime(expires: number): void {
        if (!expires) {
            throw new IncompleteSessionDataError(SessionKey.Expires);
        }

        // This time corresponds to the time precision given by the accounts service in seconds.
        const dateNowMilliseconds = Number(Date.now().toPrecision(10)) / 1000;
        if (expires <= dateNowMilliseconds) {
            throw new SessionExpiredError(expires, dateNowMilliseconds);
        }
    }
}
