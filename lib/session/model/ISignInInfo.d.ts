import { AccessToken } from "./AccessToken";
import { SessionKeys } from "../SessionKeys";
export interface ISignInInfo {
    [SessionKeys.AccessToken]?: AccessToken;
    [SessionKeys.AdminPermissions]?: string;
    [SessionKeys.CompanyNumber]?: string;
    [SessionKeys.SignedIn]?: number;
    [SessionKeys.UserProfile]?: IUserProfile;
}
export interface IUserProfile {
    [SessionKeys.Email]?: string | null;
    [SessionKeys.Forename]?: string | null;
    [SessionKeys.UserId]?: string | null;
    [SessionKeys.Locale]?: string | null;
    [SessionKeys.Scope]?: string | null;
    [SessionKeys.Permissions]?: IMap<boolean> | null;
    [SessionKeys.Surname]?: string | null;
}
export interface IMap<T> {
    [key: string]: T;
}
