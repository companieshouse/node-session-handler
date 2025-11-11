import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
export declare class Session {
    data: Readonly<ISession>;
    constructor(data?: Readonly<ISession>);
    get<T = ISessionValue>(key: SessionKey): T | undefined;
    getExtraData<T>(key: string): T | undefined;
    setExtraData<T>(key: string, value: T): void;
    deleteExtraData(key: string): boolean;
    getLanguage(): string | undefined;
    setLanguage(language: string): void;
    verify(): void;
    private verifySignInInfo;
    private verifyExpiryTime;
    private logRecordArray;
}
