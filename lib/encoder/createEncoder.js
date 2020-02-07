"use strict";

const msgpack = require("msgpack");

const createEncoder = function () {

    const me = {};

    me.decodeMsgpack = function (base) {
        return msgpack.unpack(base);
    };

    me.encodeMsgpack = function (base) {
        return msgpack.pack(base);
    };

    me.decodeBase64 = function (base) {
        return Buffer.from(base, "base64");
    };

    me.encodeBase64 = function (base) {
        return base.toString("base64");
    };

    return me;
};

module.exports = createEncoder();
