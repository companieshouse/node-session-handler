/// <reference types="node" />
import { Session } from "../session/model/Session";
export declare enum EncondingConstant {
    _idOctets = 21,
    _signatureStart = 28,
    _signatureLength = 27,
    _cookieValueLength = 55
}
export declare class Encoding {
    static decodeMsgpack(base: any): string;
    static encodeMsgpack(base: any): string;
    static decodeBase64(base: any): Buffer;
    static encodeBase64(base: any): string;
    static generateSignature(id: string, secret: string): string;
    static generateSha1SumBase64(base: any): string;
    static generateRandomBytesBase64(numBytes: number): string;
    static generateRandomBytesBase64Async(numBytes: number): Promise<string>;
    static decodeSession(encodedData: any): Session;
    static encodeSession(session: Session): string;
    static generateSessionId(): string;
    static generateSessionIdAsync(): Promise<string>;
}
