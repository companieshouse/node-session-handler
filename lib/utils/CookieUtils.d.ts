export declare function generateSessionId(): string;
export declare function generateRandomBytesBase64(numBytes: number): string;
export declare function generateSignature(id: string, secret: string): string;
export declare function extractSessionId(sessionCookie: string): string;
export declare function extractSignature(sessionCookie: string): string;
