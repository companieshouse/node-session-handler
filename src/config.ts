"use strict";

const config = {
    redis: {
        address: process.env.CACHE_SERVER
    },
    session: {
        secret: process.env.COOKIE_SECRET,
        expiryPeriod: process.env.DEFAULT_SESSION_EXPIRATION
    }
};

export = config;
