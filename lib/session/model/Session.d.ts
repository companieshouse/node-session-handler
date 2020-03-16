import { SessionKey } from "../keys/SessionKey";
import { ISession, ISessionValue } from "./SessionInterfaces";
export declare class Session {
    private dirty;
    data: ISession;
    constructor(data?: any);
    setSessionData(data: ISession): void;
    isDirty(): boolean;
    setDirty(dirty: boolean): void;
    get<T = ISessionValue>(key: SessionKey): T | undefined;
    getExtraData<T>(key: string): T | undefined;
    saveExtraData<T>(key: string, val: T): void;
    deleteExtraData(key: string): boolean;
    verify: () => void;
    static createInstance: (object: any) => Session;
}
