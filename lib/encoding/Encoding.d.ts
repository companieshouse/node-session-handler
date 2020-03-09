export declare class Encoding {
    static encode: (data: any) => string;
    private static encodeMsgpack;
    static decode: (data: string) => any;
    private static decodeMsgpack;
}
