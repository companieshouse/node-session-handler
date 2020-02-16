export interface SessionHandlerConfig {
    cookieSecret: string,
    cookieName: string,
    defaultSessionExpiration: number,
    cacheServer: string,
    cacheDB: number,
    cachePassword: string
}
