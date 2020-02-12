import { ISignInInfo } from "./ISignInInfo";
import { SessionKeys } from "../SessionKeys";
import { Encoding } from "../../encoding/Encoding";
import { SessionId } from "../../SessionValidator";

interface ISession {
    [SessionKeys.Id]: string;
    [SessionKeys.SignInInfo]?: ISignInInfo;
}

export const newSession = async (): Promise<ISession> => {
    return new class implements ISession {
        [SessionKeys.Id]: string = await Encoding.generateSessionId();
        [SessionKeys.SignInInfo]?: ISignInInfo;
    }();
};

export const Session = (id: SessionId): ISession => {
    return new class implements ISession {
        [SessionKeys.Id]: string = id.sessionIdValue;
        [SessionKeys.SignInInfo]?: ISignInInfo;
    }();
};

Session({sessionIdValue: "hello"})