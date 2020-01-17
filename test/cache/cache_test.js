const chai = require('chai');
const expect = chai.expect;

const {options, Cache} = require('../../cache');

describe("foo", function() {
  it("bar", function() {
    let opts = new Options();
    options.setPassword = "Hello";
    options.setAddr = "localhost";
    options.setDb = "0";

    let cache = new Cache(options);

    expect(true).to.equal(true);
  })
});
