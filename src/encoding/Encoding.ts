"use strict";

import msgpack from "msgpack";
import crypto from "crypto";
import { promisify } from "util";
const randomBytesAsync = promisify(crypto.randomBytes);

class Encoding {

    static decodeMsgpack(base: any) {
        return msgpack.unpack(base);
    }

    static encodeMsgpack(base: any) {
        return msgpack.pack(base);
    }

    static decodeBase64(base: any) {
        return Buffer.from(base, "base64");
    }

    static encodeBase64(base: any) {
        return base.toString("base64");
    }

    static generateSha1SumBase64(base: any) {

        return crypto
            .createHash("sha1")
            .update(base)
            .digest("base64");
    }

    static async generateRandomBytesBase64(numBytes: number) {

        try {
            return (await randomBytesAsync(numBytes)).toString("base64");
        } catch (error) {
            throw new Error(error);
        }
    }
}

export = Encoding;
