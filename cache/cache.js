const Redis = require('ioredis');

module.exports.Options = class Options {

  #password;
  #addr;
  #db;

  constructor() {
    this.#password = "";
    this.#addr = "";
    this.#db = "";
  };

  get password() {
    return this.#password;
  };

  set password(password) {
    this.#password = password;
  };

  get addr() {
    return this.#addr;
  };

  set addr(addr) {
    this.#addr = addr;
  };

  get db() {
    return this.#db;
  };

  set db(db) {
    this.#db = db;
  };
};

module.exports.Cache = class Cache {

    #client;

    constructor(options) {
      client = new Redis('redis://' + options.getPassword + '@' + options.getAddr + '/' + options.getDb);
    };

    set(key, value) {
      this.client.set(key, value);
    };

    get(key) {
      return this.client.get(key);
    };

    delete(key) {
      this.client.del(key);
    };
};
