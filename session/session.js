class Session {
  #id;
  #expires;
  #data;

  constructor() {
    this.#id = "";
    this.#expires = 0;
    this.#data = {};
  };

  get getId() {
    return this.#id;
  }

  set setId(id) {
    this.#id = id;
  }

  get getExpires() {
    return this.#expires;
  }

  set setExpires(expires) {
    this.#expires = expires;
  }

  get getData() {
    return this.#data;
  }

  set setData(data) {
    this.#data = data;
  }
};

module.exports = Session;
