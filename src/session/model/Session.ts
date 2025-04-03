import { IncompleteSessionDataError, SessionExpiredError } from "./SessionErrors";
import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";
import { AccessTokenKeys } from "../keys/AccessTokenKeys";
import { loggerInstance } from "../../Logger";
import { UserProfileKeys } from "../keys/UserProfileKeys";

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
        const signInInfo = this.data[SessionKey.SignInInfo];
        if (signInInfo) {
            if (signInInfo[SignInInfoKeys.SignedIn] === 1) {
                this.verifySignInInfo(signInInfo);
            } else {
                // If the user is not signed in, it's not an error but log the signInInfo to see what is there
                this.logRecordArray(signInInfo, "SignInInfo");
            }
        }

        this.verifyExpiryTime(this.data[SessionKey.Expires]);
    };

    private verifySignInInfo(signInInfo: Record<string, any>): void {
        const accessToken = signInInfo[SignInInfoKeys.AccessToken];
        if (!accessToken || !accessToken[AccessTokenKeys.AccessToken]) {
            this.logRecordArray(signInInfo, "SignInInfo");
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

    private logRecordArray(recordArray: Record<string, any>, arrayName: string = ""): void {
        for (const [key, value] of Object.entries(recordArray)) {
            if (value && typeof value === "object" && value !== null && !Array.isArray(value)) {
                // If the value is an object, recursively log its entries
                this.logRecordArray(value, key);
            } else {
                // Log the key-value pair
                if (typeof key === "string" && key.endsWith("_token")) {
                    loggerInstance().info(`${arrayName} Key: ${key}, Value: <present>`);
                } else {
                    loggerInstance().info(`${arrayName} Key: ${key}, Value: ${value}`);
                }
            }
        }
    }
}
