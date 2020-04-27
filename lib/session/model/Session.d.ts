import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
export declare class Session {
    private data;
    constructor(data?: ISession);
    get<T = ISessionValue>(key: SessionKey): T | undefined;
    getExtraData<T>(key: string): T | undefined;
    setExtraData<T>(key: string, value: T): void;
    deleteExtraData(key: string): boolean;
    verify: () => void;
}
