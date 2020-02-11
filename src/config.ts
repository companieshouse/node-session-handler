"use strict";

const config = {
    redis: {
        address: process.env.CACHE_SERVER
    },
    session: {
        secret: process.env.COOKIE_SECRET as string,
        expiryPeriod: parseInt(process.env.DEFAULT_SESSION_EXPIRATION as string),
        cookieName: process.env.COOKIE_NAME as string
    }
};

export = config;
