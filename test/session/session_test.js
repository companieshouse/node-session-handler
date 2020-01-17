const chai = require('chai');
const expect = chai.expect;

const Session = require('../../session');

describe("session getting and setting", function() {
  it("basic initialisation of session object", function() {
    let session = new Session();

    expect(session.id).to.equal("");
    expect(session.expires).to.equal(0);
    expect(session.data).to.be.empty;
  });

  it("set and get data (other than initialisation) from session object", function() {
    let id = "Hello, world!";
    let expires = 5000;
    let data = "{\"test\": \"I am some data\"}";
    let session = new Session();

    session.id = id;
    session.expires = expires;
    session.data = data;

    expect(session.id).to.equal(id);
    expect(session.expires).to.equal(expires);
    expect(session.data).to.equal(data);
  })
});