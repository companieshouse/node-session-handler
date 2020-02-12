import { IAccessToken } from "./IAccessToken";
import { SessionKeys } from "../SessionKeys";

export interface ISignInInfo {
    [SessionKeys.AccessToken]?: IAccessToken;
    [SessionKeys.AdminPermissions]?: boolean;
    [SessionKeys.CompanyNumber]?: string;
    [SessionKeys.SignedIn]?: boolean;
    [SessionKeys.UserProfile]?: IUserProfile;
}

export interface IUserProfile {
    [SessionKeys.Email]?: string;
    [SessionKeys.Forename]?: string;
    [SessionKeys.Id]?: string;
    [SessionKeys.Locale]?: string;
    [SessionKeys.Scope]?: string;
    [SessionKeys.Permissions]?: IMap<boolean>;
    [SessionKeys.Surname]?: string;
}

export interface IMap<T> {
    [key: string]: T;
}