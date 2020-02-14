export interface SessionHandlerConfig {
    sessionSecret: string;
    expiryPeriod: number;
    redisUrl: string;
}
