"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack_1 = __importDefault(require("msgpack"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const Session_1 = require("../session/model/Session");
var EncondingConstant;
(function (EncondingConstant) {
    EncondingConstant[EncondingConstant["_idOctets"] = 21] = "_idOctets";
    EncondingConstant[EncondingConstant["_signatureStart"] = 28] = "_signatureStart";
    EncondingConstant[EncondingConstant["_signatureLength"] = 27] = "_signatureLength";
    EncondingConstant[EncondingConstant["_cookieValueLength"] = 55] = "_cookieValueLength";
})(EncondingConstant = exports.EncondingConstant || (exports.EncondingConstant = {}));
class Encoding {
    static decodeMsgpack(base) {
        return msgpack_1.default.unpack(base);
    }
    static encodeMsgpack(base) {
        return msgpack_1.default.pack(base);
    }
    static decodeBase64(base) {
        return Buffer.from(base, "base64");
    }
    static encodeBase64(base) {
        return base.toString("base64");
    }
    static generateSignature(id, secret) {
        const adjustedId = id.substr(0, EncondingConstant._idOctets);
        return this.generateSha1SumBase64(adjustedId + secret).substr(0, EncondingConstant._signatureLength);
    }
    static generateSha1SumBase64(base) {
        return crypto_1.default
            .createHash("sha1")
            .update(base)
            .digest("base64");
    }
    static generateRandomBytesBase64(numBytes) {
        return crypto_1.default.randomBytes(numBytes).toString("base64");
    }
    static generateRandomBytesBase64Async(numBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            const asyncFun = util_1.promisify(crypto_1.default.randomBytes);
            return (yield asyncFun(numBytes)).toString("base64");
        });
    }
    static decodeSession(encodedData) {
        const base64Decoded = Encoding.decodeBase64(encodedData);
        return new Session_1.Session(Encoding.decodeMsgpack(base64Decoded));
    }
    static encodeSession(session) {
        return Encoding.encodeBase64(Encoding.encodeMsgpack(session.unmarshall()));
    }
    static generateSessionId() {
        return Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
    }
    static generateSessionIdAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return Encoding.generateRandomBytesBase64Async(EncondingConstant._idOctets);
        });
    }
}
exports.Encoding = Encoding;
//# sourceMappingURL=Encoding.js.map