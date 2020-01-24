const Redis = require("ioredis");

const createCache = function (options) {

    const client = new Redis("redis://" + options.password + "@" + options.address + "/" + options.db);

    const cache = {};

    cache.set = async function (key, value) {
        await client.set(key,value);
    };

    cache.get = async function (key) {
        return await client.get(key);
    };

    cache.del = async function (key) {
        await client.del(key);
    }

    return cache;
};

module.exports = createCache;
