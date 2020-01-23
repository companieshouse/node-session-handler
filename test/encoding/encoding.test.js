const chai = require("chai");
const expect = chai.expect;

const encoding = require("../../encoding");

describe("msgpack tests", function() {
  it("encodes from a string to a msgpacked buffer and decodes vice versa correctly", function() {
    let valueToEncode = "{\"test\": \"JSON that needs encoding\"}";

    let encodedValue = encoding.encodeMsgpack(valueToEncode);
    expect(encodedValue).to.be.an.instanceof(Buffer);

    let decodedValue = encoding.decodeMsgpack(encodedValue);
    expect(decodedValue).to.equal(valueToEncode);
  });
});

describe("base64 tests", function() {
  it("encodes from a string to a base64", function() {
    let valueToEncode = "{\"test\": \"JSON that needs encoding\"}";
    let expectedResult = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBlbmNvZGluZyJ9";

    let encodedValue = encoding.encodeBase64(Buffer.from(valueToEncode));
    expect(encodedValue).to.equal(expectedResult);
  });

  it ("decodes from a base64-encoded string to a buffer", function() {
    let valueToDecode = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBkZWNvZGluZyJ9";
    let expectedResult = "{\"test\": \"JSON that needs decoding\"}";

    let decodedValue = encoding.decodeBase64(valueToDecode);
    expect(decodedValue).to.be.instanceof(Buffer);
    expect(decodedValue.toString()).to.equal(expectedResult);
  });

  it("generates an sha1 sum from a base64 encoded string", function() {
    let valueToEncode = "eyJ0ZXN0IjogIkpTT04gdGhhdCBuZWVkcyBlbmNvZGluZyJ9";
    let expectedResult = "H62YaJh/S2EhshP1avkKuxRAJD0=";

    let sha1sum = encoding.generateSha1SumBase64(valueToEncode);

    expect(sha1sum).to.equal(expectedResult);
    expect(sha1sum).to.be.a("string");
  });

  it ("generates some random base64 encoded bytes based on the number of bytes passed in", async function() {
    let numBytes = 21;

    let result = await encoding.generateRandomBytesBase64(numBytes);
    expect(result).to.be.a("string");
  });
});
