const chai = require('chai');
const expect = chai.expect;

const encoding = require('../../encoding');

describe("encoding tests", function() {
  it("encodes from a string to a msgpack'd buffer and decodes vice versa correctly", function() {
    let valueToEncode = "A string that needs encoding";

    let encodedValue = encoding.encodeMsgpack(valueToEncode);
    expect(encodedValue).to.be.instanceof(Buffer);

    let decodedValue = encoding.decodeMsgpack(encodedValue);
    expect(decodedValue).to.equal("A string that needs encoding");
  });
});
