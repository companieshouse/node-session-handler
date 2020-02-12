"use strict";

import msgpack from "msgpack";
import crypto from "crypto";
import { promisify } from "util";
import config from "../config";
import {SessionKeys} from "../session/SessionKeys";
import { Session } from '../session/model/ISession';
const randomBytesAsync = promisify(crypto.randomBytes);

export class Encoding {

    public static readonly _idOctets = 21;

    public static decodeMsgpack(base: any) {
        return msgpack.unpack(base);
    }

    public static encodeMsgpack(base: any) {
        return msgpack.pack(base);
    }

    public static decodeBase64(base: any) {
        return Buffer.from(base, "base64");
    }

    public static encodeBase64(base: any) {
        return base.toString("base64");
    }

    public static generateSha1SumBase64(base: any) {

        return crypto
            .createHash("sha1")
            .update(base)
            .digest("base64");
    }

    public static async generateRandomBytesBase64(numBytes: number) {

        try {
            return (await randomBytesAsync(numBytes)).toString("base64");
        } catch (error) {
            throw new Error(error);
        }
    }

    public static decodeSession<T>(encodedData: any): T {

        const base64Decoded = Encoding.decodeBase64(encodedData);

        return Encoding.decodeMsgpack(base64Decoded);
    }


    public static generateExpiry(): number {
        return Date.now() + config.session.expiryPeriod;
    }

    public static async encodeSession(session: Session): Promise<string> {
        if (session[".id"] === "") {
            session[".id"] = await Encoding.generateSessionId();
            if (!session.signin_info?.access_token) {
                const signInInfo = session.signin_info;
                signInInfo.access_token = {
                    [SessionKeys.AccessToken]: Encoding.generateExpiry()
                };
            }
        }
        return Encoding.encodeBase64(Encoding.encodeMsgpack(session));
    }

    public static async generateSessionId(): Promise<string> {
        return Encoding.generateRandomBytesBase64(this._idOctets);
    }
}
