export interface CookieConfig {
    cookieSecret: string;
    cookieName: string;
    cookieDomain: string;
    cookieSecureFlag?: boolean;
    cookieTimeToLiveInSeconds?: number;
}
