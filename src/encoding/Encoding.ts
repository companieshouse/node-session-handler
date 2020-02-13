import msgpack from "msgpack";
import crypto from "crypto";
import { promisify } from "util";
import { UnverifiedSession, Session, VerifiedSession } from "../session/model/Session";
const randomBytesAsync = promisify(crypto.randomBytes);

export enum EncondingConstant {
    _idOctets = (7 * 3),
    _signatureStart = (_idOctets * 4) / 3,
    _signatureLength = 27,
    _cookieValueLength = _signatureStart + _signatureLength

}

export class Encoding {

    public static decodeMsgpack(base: any): string {
        return msgpack.unpack(base);
    }

    public static encodeMsgpack(base: any): string {
        return msgpack.pack(base);
    }

    public static decodeBase64(base: any): Buffer {
        return Buffer.from(base, "base64");
    }

    public static encodeBase64(base: any): string {
        return base.toString("base64");
    }

    public static generateSignature(id: string, secret: string): string {
        const adjustedId = id.substr(0, EncondingConstant._idOctets);
        return this.generateSha1SumBase64(adjustedId + secret).substr(0, EncondingConstant._signatureLength);
    }

    public static generateSha1SumBase64(base: any): string {

        return crypto
            .createHash("sha1")
            .update(base)
            .digest("base64");
    }

    public static async generateRandomBytesBase64(numBytes: number): Promise<string> {

        try {
            return (await randomBytesAsync(numBytes)).toString("base64");
        } catch (error) {
            throw new Error(error);
        }
    }

    public static decodeSession(encodedData: any): UnverifiedSession {

        const base64Decoded = Encoding.decodeBase64(encodedData);

        return UnverifiedSession.parseSession(Encoding.decodeMsgpack(base64Decoded));
    }

    public static encodeSession(session: UnverifiedSession): string {
        return Encoding.encodeBase64(Encoding.encodeMsgpack(session.unmarshall()));
    }

    public static async generateSessionId(): Promise<string> {
        return Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
    }
}
