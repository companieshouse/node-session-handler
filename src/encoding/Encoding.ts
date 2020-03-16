import msgpack5 from "msgpack5";

export class Encoding {

    public static encode = (data: any): string => {
        if (!data) {
            throw new Error("Value to encode must be defined");
        }

        return Encoding.encodeMsgpack(data);
    };

    private static encodeMsgpack = (data: any): string => {
        return msgpack5().encode(data).toString("base64");
    };

    public static decode = (data: string): any => {
        if (!data) {
            throw new Error("Value to decode must be defined");
        }
        return Encoding.decodeMsgpack(data);
    };

    private static decodeMsgpack = (data: any): any => {
        const buffer = Buffer.from(data, "base64");
        let decoded;
        try {
            decoded = JSON.parse(msgpack5().decode(buffer));
        } catch (error) {
            decoded = msgpack5().decode(buffer);
        }
        return decoded;
    };

}
