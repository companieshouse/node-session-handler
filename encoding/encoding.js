const msgpack = require("msgpack");
const crypto = require("crypto")

module.exports = {
  decodeMsgpack: function(base) {
    return msgpack.unpack(base);
  },

  encodeMsgpack: function(base) {
    return msgpack.pack(base);
  },

  decodeBase64: function(base) {
    return Buffer.from(base, "base64");
  },

  encodeBase64: function(base) {
    return base.toString("base64");
  },

  generateSha1SumBase64: function(base) {
    return crypto.createHash("sha1").update(base).digest("base64");
  },

  generateRandomBytesBase64: function(numBytes) {

    return new Promise(function (resolve, reject) {

      crypto.randomBytes(numBytes, function (error, buffer) {

        if (error) {
          return reject(error);
        }

        return resolve(buffer.toString("base64"));
      })
    });
  }
};
