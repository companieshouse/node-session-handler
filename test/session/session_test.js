const chai = require('chai');
const expect = chai.expect;

const Session = require('../../session');

describe("session getting and setting", function() {
  it("basic initialisation of session object", function() {
    let session = new Session();

    expect(session.getId).to.equal("");
    expect(session.getExpires).to.equal(0);
    expect(session.getData).to.be.empty;
  });

  it("set and get data (other than initialisation) from session object", function() {
    let id = "Hello, world!";
    let expires = 5000;
    let data = "{\"test\": \"I am some data\"}";
    let session = new Session();

    session.setId = id;
    session.setExpires = expires;
    session.setData = data;

    expect(session.getId).to.equal(id);
    expect(session.getExpires).to.equal(expires);
    expect(session.getData).to.equal(data);
  })
});
