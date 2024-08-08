import { AccessTokenKeys } from "../keys/AccessTokenKeys";
import { SessionKey } from "../keys/SessionKey";
import { SignInInfoKeys } from "../keys/SignInInfoKeys";
import { UserProfileKeys } from "../keys/UserProfileKeys";

export type ISessionValue = ISignInInfo | IUserProfile | IAccessToken | string | number;

export type ISession = {
    [SessionKey.Id]?: string,
    [SessionKey.ClientSig]?: string,
    [SessionKey.Hijacked]?: string | null,
    [SessionKey.OAuth2Nonce]?: string,
    [SessionKey.ZXSKey]?: string,
    [SessionKey.Expires]?: number,
    [SessionKey.LastAccess]?: number,
    [SessionKey.Pst]?: string,
    [SessionKey.SignInInfo]?: ISignInInfo,
    [SessionKey.ExtraData]?: any,
    [SessionKey.CsrfToken]?: string
};

export type ISignInInfo = {
    [SignInInfoKeys.AccessToken]?: IAccessToken,
    [SignInInfoKeys.AdditionalScope]?: string;
    [SignInInfoKeys.AdminPermissions]?: string,
    [SignInInfoKeys.CompanyNumber]?: string,
    [SignInInfoKeys.SignedIn]?: number,
    [SignInInfoKeys.UserProfile]?: IUserProfile,
};

export type IUserProfile = {
    [UserProfileKeys.Email]?: string,
    [UserProfileKeys.Forename]?: string,
    [UserProfileKeys.UserId]?: string,
    [UserProfileKeys.Locale]?: string,
    [UserProfileKeys.Scope]?: string,
    [UserProfileKeys.Surname]?: string,
    [UserProfileKeys.Permissions]?: {
        [Key: string]: any;
    },
    [UserProfileKeys.TokenPermissions]?: {
        [Key: string]: string;
    }
};

export type IAccessToken = {
    [AccessTokenKeys.AccessToken]?: string,
    [AccessTokenKeys.ExpiresIn]?: number,
    [AccessTokenKeys.RefreshToken]?: string,
    [AccessTokenKeys.TokenType]?: string,
};
