"use strict";

const sinon = require("sinon");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

const createStore = require("../../lib/store");

describe("Store", function () {
    describe("session token size", function () {

        const cache = sinon.stub();
        const config = {
            secret: "hello world",
            expiryPeriod: 1000
        };

        it("session token is too small", function () {

            const tooSmall = "hello";

            const store = createStore(cache, config);

            expect(store.load(tooSmall)).to.be.rejectedWith(Error, "Encrypted session token not long enough");
        });

        it("session token is too big", function () {

            const tooBig = "this is way too long to be considered a valid encrypted session token but we'll try it anyway";

            const store = createStore(cache, config);

            expect(store.load(tooBig)).to.be.rejectedWith(Error, "Expected signature does not equal actual");
        });

        it("session token is correct size but invalid", function () {

            const justRight = "this is a string that is exactly the right size for you";

            const store = createStore(cache, config);

            expect(store.load(justRight)).to.be.rejectedWith(Error, "Expected signature does not equal actual");
        });
    });
});
