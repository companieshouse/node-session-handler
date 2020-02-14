import msgpack from "msgpack";
import crypto from "crypto";
import { promisify } from "util";
import { Session, VerifiedSession } from "../session/model/Session";

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

    public static generateRandomBytesBase64(numBytes: number): string {
        return crypto.randomBytes(numBytes).toString("base64");

    }

    public static async generateRandomBytesBase64Async(numBytes: number): Promise<string> {
        const asyncFun = promisify(crypto.randomBytes);
        return (await asyncFun(numBytes)).toString("base64");

    }

    public static decodeSession(encodedData: any): Session {

        const base64Decoded = Encoding.decodeBase64(encodedData);

        return new Session(Encoding.decodeMsgpack(base64Decoded));
    }

    public static encodeSession(session: Session): string {
        return Encoding.encodeBase64(Encoding.encodeMsgpack(session.unmarshall()));
    }

    public static generateSessionId(): string {
        return Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
    }

    public static async generateSessionIdAsync(): Promise<string> {
        return Encoding.generateRandomBytesBase64Async(EncondingConstant._idOctets);
    }
}
