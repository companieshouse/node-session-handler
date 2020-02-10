"use strict";

const Redis = require("ioredis");

const createCache = function (options) {

    const me = {};

    const client = new Redis(`redis://${options.password}@${options.address}/${options.db}`);

    me.set = async function (key, value) {
        await client.set(key, value);
    };

    me.get = function (key) {
        return client.get(key);
    };

    me.del = async function (key) {
        await client.del(key);
    };

    return me;
};

module.exports = createCache;
