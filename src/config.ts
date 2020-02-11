"use strict";

const config = {
    redis: {
        address: process.env.CACHE_SERVER
    },
    session: {
        secret: process.env.COOKIE_SECRET,
        expiryPeriod: parseInt(process.env.DEFAULT_SESSION_EXPIRATION as string)
    }
};

export = config;
