"use strict";

const config = require("./config");
const redis = require("redis");
const session = require("express-session");
const encoder = require("./encoder");

const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient(`redis://${config.redis.address}`);

const chSession = session({
    store: new RedisStore({
        client: redisClient,
        serializer: {
            parse: function (encodedData) {

                const base64Decoded = encoder.decodeBase64(encodedData);

                return encoder.decodeMsgpack(base64Decoded);
            },
            stringify: function (sessionData) {
                return encoder.encodeBase64(encoder.encodeMsgpack(sessionData));
            }
        }
    }),
    secret: config.session.secret,
    resave: false,
    name: "__SID"
});

const sessionChecker = function (request, _response, next) {
    if (!request.session) {
        return next(new Error("Oh no!"));
    }

    return next();
};

module.exports = [
    chSession,
    sessionChecker
];
