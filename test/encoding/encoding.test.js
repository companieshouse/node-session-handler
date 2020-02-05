const chai = require("chai");
const expect = chai.expect;

const encoding = require("../../lib/enc");

describe("msgpack tests", function () {
    it("encodes from a string to a msgpacked buffer and decodes vice versa correctly", function () {

        const valueToEncode = "{\"test\": \"JSON that needs encoding\"}";

        const encodedValue = encoding.encodeMsgpack(valueToEncode);
        const decodedValue = encoding.decodeMsgpack(encodedValue);

        expect(encodedValue).to.be.an.instanceof(Buffer);
        expect(decodedValue).to.equal(valueToEncode);
    });
});

describe("base64 tests", function () {
    it("encodes from a string to a base64", function () {

        const valueToEncode = "{\"test\": \"JSON that needs encoding\"}";
        const expectedResult = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBlbmNvZGluZyJ9";

        const encodedValue = encoding.encodeBase64(Buffer.from(valueToEncode));

        expect(encodedValue).to.equal(expectedResult);
    });

    it("decodes from a base64-encoded string to a buffer", function () {

        const valueToDecode = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBkZWNvZGluZyJ9";
        const expectedResult = "{\"test\": \"JSON that needs decoding\"}";

        const decodedValue = encoding.decodeBase64(valueToDecode);

        expect(decodedValue).to.be.instanceof(Buffer);
        expect(decodedValue.toString()).to.equal(expectedResult);
    });

    it("generates an sha1 sum from a base64 encoded string", function () {

        const valueToEncode = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBlbmNvZGluZyJ9";
        const expectedResult = "H62YaJh/S2EhshP1avkKuxRAJD0=";

        const sha1sum = encoding.generateSha1SumBase64(valueToEncode);

        expect(sha1sum).to.equal(expectedResult);
        expect(sha1sum).to.be.a("string");
    });

    it("generates some random base64 encoded bytes based on the number of bytes passed in", async function () {

        const numBytes = 21;

        const result = await encoding.generateRandomBytesBase64(numBytes);

        expect(result).to.be.a("string");
    });
});
