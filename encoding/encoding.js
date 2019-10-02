const msgpack = require('msgpack');
const sha1 = require('crypto-js/sha1')

//Returns an object

module.exports = {
  decodeMsgpack: function(base) {
    return msgpack.unpack(base);
  },

  encodeMsgpack: function(base) {
    return msgpack.pack(base);
  },

  decodeBase64: function(base) {
    return Buffer.from(base, 'base64');
  },

  encodeBase64: function(base) {
    return Buffer.from(base).toString('base64');
  },

  generateSha1Sum: function(base) {
    return sha1(base);
  }
};
