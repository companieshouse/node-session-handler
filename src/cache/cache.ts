"use strict";

import Redis from "ioredis";

import config from "../config";

class Cache {

    private client: Redis.Redis;

    constructor() {
        this.client = new Redis(`redis://${config.redis.address}`);
    }

    async set(key: string, value: string) {
        await this.client.set(key, value);
    }

    get(key: string) {
        return this.client.get(key);
    }

    async del(key: string) {
        await this.client.del(key);
    }
}

export = new Cache();
