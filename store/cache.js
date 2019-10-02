const Redis = require('ioredis');

module.exports = class Cache {

    #client;

    constructor(options) {
      this.client = new Redis('redis://' + options.password + '@' + options.addr + '/' + options.db);
    };

    set(key, value) {
      this.client.set(key, value);
    };

    get(key) {
      return this.client.get(key);
    }

    delete(key) {
      this.client.del(key);
    }
};
