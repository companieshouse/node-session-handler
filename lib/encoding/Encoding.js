"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encoding = void 0;
const msgpack5_1 = __importDefault(require("msgpack5"));
class Encoding {
}
exports.Encoding = Encoding;
Encoding.encode = (data) => {
    if (!data) {
        throw new Error("Value to encode must be defined");
    }
    return Encoding.encodeMsgpack(data);
};
Encoding.encodeMsgpack = (data) => {
    return (0, msgpack5_1.default)().encode(data).toString("base64");
};
Encoding.decode = (data) => {
    if (!data) {
        throw new Error("Value to decode must be defined");
    }
    return Encoding.decodeMsgpack(data);
};
Encoding.decodeMsgpack = (data) => {
    const buffer = Buffer.from(data, "base64");
    let decoded;
    try {
        decoded = JSON.parse((0, msgpack5_1.default)().decode(buffer));
    }
    catch (error) {
        decoded = (0, msgpack5_1.default)().decode(buffer);
    }
    return decoded;
};
//# sourceMappingURL=Encoding.js.map