import { expect } from "chai";
import { Encoding } from "../../src/encoding/Encoding";

const decodedData = { name: "tester", age: 21 };
const encodedData = "unsibmFtZSI6InRlc3RlciIsImFnZSI6MjF9";

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
});
