import { expect } from "chai";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { Encoding } from "../../src/encoding/Encoding";
import { createSessionData } from "../utils/SessionGenerator";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

const decodedData = { name: "tester", age: 21 };
const encodedData = "gqRuYW1lpnRlc3RlcqNhZ2UV";

describe("Coding and decoding", () => {
    describe("encode", () => {
        it("should throw error when value is undefined", () => {
            expect(() => Encoding.encode(undefined)).to.throw("Value to encode must be defined");
        });

        it("should encode valid JSON data", () => {
            expect(Encoding.encode(decodedData)).to.be.equal(encodedData);
        });
    });

    describe("decode", () => {
        it("should throw error when value is undefined", () => {
            expect(() => Encoding.decode(undefined)).to.throw("Value to decode must be defined");
        });

        it("should decode valid JSON data", () => {
            expect(Encoding.decode(encodedData)).to.be.deep.equal(decodedData);
        });
    });

    it("should encode and decode to the same data", () => {
        const encoded = Encoding.encode(decodedData);
        const decoded = Encoding.decode(encoded);

        expect(decoded).to.be.deep.equal(decodedData)
    });

    it("should encode and decode data with nested objects", () => {
        const sessionData = createSessionData(generateRandomBytesBase64(16))
        sessionData[SessionKey.ExtraData] = {
            car: {
                wheels: 4
            }
        }

        const encoded = Encoding.encode(sessionData);
        const decoded = Encoding.decode(encoded);

        expect(decoded).to.be.deep.equal(sessionData);
    })
});
