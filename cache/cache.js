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

  get getPassword() {
    return this.#password;
  };

  set setPassword(password) {
    this.#password = password;
  };

  get getAddr() {
    return this.#addr;
  };

  set setAddr(addr) {
    this.#addr = addr;
  };

  get getDb() {
    return this.#db;
  };

  set setDb(db) {
    this.#db = db;
  };
};

module.exports.Cache = class Cache {

    #client;

    constructor(options) {
      this.client = new Redis('redis://' + options.getPassword + '@' + options.getAddr + '/' + options.getDb);
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
