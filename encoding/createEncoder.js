const msgpack = require("msgpack");
const crypto = require("crypto");
const promisify = require("util").promisify;

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

    me.generateSha1SumBase64 = function (base) {
        return crypto.createHash("sha1").update(base).digest("base64");
    };

    me.generateRandomBytesBase64 = promisify(function (numBytes, done) {

        crypto.randomBytes(numBytes, function (error, buffer) {

            if (error) {
                return done(error);
            }

            return done(undefined, buffer.toString("base64"));
        });
    });

    return me;
};

module.exports = createEncoder();
