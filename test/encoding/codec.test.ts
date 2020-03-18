import { expect } from "chai";
import { Encoding } from "../../src/encoding/Encoding";
import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

const decodedData = { name: "tester", age: 21 };
const encodedData = "gqRuYW1lpnRlc3RlcqNhZ2UV";
const session = createNewVerifiedSession(generateRandomBytesBase64(16));

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

        expect(decoded).to.be.deep.equal(decodedData);

    });

    it("should encode and decode data with nested objects", () => {

        interface Car {
            wheels: number
        }

        interface SomeInterface {
            car: Car
        }

        session.saveExtraData("appeals", {
            car: {
                wheels: 4
            }
        } as SomeInterface);

        const encodedSession = Encoding.encode(session.data);
        const decodedSession = Encoding.decode(encodedSession);

        expect(decodedSession).to.be.deep.equal(session.data);

    });
});
