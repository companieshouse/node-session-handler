import { IncompleteSessionDataError, SessionExpiredError } from "./SessionErrors";
import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";
import { AccessTokenKeys } from "../keys/AccessTokenKeys";

export class Session {

    public constructor(private data: ISession = {}) {}

    public get<T = ISessionValue>(key: SessionKey): T | undefined {
        return this.data[key];
    }

    public getExtraData<T>(key: string): T | undefined {
        return this.data[SessionKey.ExtraData][key];
    }

    public setExtraData<T>(key: string, value: T): void {
        if (this.data[SessionKey.ExtraData] == null) {
            this.data[SessionKey.ExtraData] = {}
        }
        this.data[SessionKey.ExtraData][key] = value;
    }

    public deleteExtraData(key: string): boolean {
        return delete this.data[SessionKey.ExtraData][key];
    }

    public verify = (): void => {
        const signInInfo = this.data[SessionKey.SignInInfo];
        if (!signInInfo) {
            throw new IncompleteSessionDataError(SessionKey.SignInInfo);
        }

        const accessToken = signInInfo[SignInInfoKeys.AccessToken];
        if (!accessToken || !accessToken[AccessTokenKeys.AccessToken]) {
            throw new IncompleteSessionDataError(SessionKey.SignInInfo, SignInInfoKeys.AccessToken);
        }

        const expires = this.data[SessionKey.Expires];
        if (!expires) {
            throw new IncompleteSessionDataError(SessionKey.Expires);
        }

        // This time corresponds to the time precision given by the accounts service in seconds.
        const dateNowMillis = Number(Date.now().toPrecision(10)) / 1000;
        if (expires <= dateNowMillis) {
            throw new SessionExpiredError(expires, dateNowMillis);
        }
    };
}
