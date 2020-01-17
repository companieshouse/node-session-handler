class Session {
  #id;
  #expires;
  #data;

  constructor() {
    this.#id = "";
    this.#expires = 0;
    this.#data = {};
  };

  get id() {
    return this.#id;
  }

  set id(id) {
    this.#id = id;
  }

  get expires() {
    return this.#expires;
  }

  set expires(expires) {
    this.#expires = expires;
  }

  get data() {
    return this.#data;
  }

  set data(data) {
    this.#data = data;
  }
};

module.exports = Session;
