import msgpack5 from "msgpack5";

export class Encoding {

    public static encode = <T>(object: T): string => {
        return Encoding.encodeMsgpack(object);
    };

    private static encodeMsgpack = (data: any): string => {
        return msgpack5().encode(JSON.stringify(data)).toString("base64");
    };

    public static decode = (value: string): any => {
        return Encoding.decodeMsgpack(value);
    };

    private static decodeMsgpack = (data: any): any => {
        const buffer = Buffer.from(data, "base64");
        return JSON.parse(msgpack5().decode(buffer));
    };

}
