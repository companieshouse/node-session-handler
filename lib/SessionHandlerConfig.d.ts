export interface SessionHandlerConfig {
    cookieConfig: CookieConfig;
    cacheConfig: CacheConfig;
}
export interface CookieConfig {
    cookieSecret: string;
    cookieName: string;
}
export interface CacheConfig {
    cacheServer: string;
    cacheDB: number;
    cachePassword: string;
}
