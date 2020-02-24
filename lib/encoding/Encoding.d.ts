export declare class Encoding {
    static encode: <T>(value: T) => string;
    private static encodeMsgpack;
    static decode: (value: string) => any;
    private static decodeMsgpack;
}
