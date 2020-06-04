declare const Cookie: {
    generateSignature: (id: string, secret: string) => string;
    extractSignature: (sessionCookie: string) => string;
    extractSessionId: (sessionCookie: string) => string;
    validateCookieSignature: (sessionCookie: string, cookieSecret: string) => boolean;
    getSessionId: (requestCookies: object) => any;
};
export = Cookie;
