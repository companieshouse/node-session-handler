"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack5_1 = __importDefault(require("msgpack5"));
class Encoding {
}
exports.Encoding = Encoding;
Encoding.encode = (value) => {
    if (!value) {
        throw new Error("Value to encode must be defined");
    }
    return Encoding.encodeMsgpack(value);
};
Encoding.encodeMsgpack = (data) => {
    return msgpack5_1.default().encode(JSON.stringify(data)).toString("base64");
};
Encoding.decode = (value) => {
    if (!value) {
        throw new Error("Value to decode must be defined");
    }
    return Encoding.decodeMsgpack(value);
};
Encoding.decodeMsgpack = (data) => {
    const buffer = Buffer.from(data, "base64");
    return JSON.parse(msgpack5_1.default().decode(buffer));
};
//# sourceMappingURL=Encoding.js.map