import 'mocha';
import { expect } from 'chai';

import * as fakeData from './_fakes/data';
import * as mock from './_fakes/mocks';
import * as stub from './_fakes/stubs';

import * as cookie from '../src/Cookie';

describe('Cookie helpers', () => {

  it('should generate session signature', () => {
    expect(cookie.generateSignature(fakeData.__SID, fakeData.cookieSecret)).to.equal('rWnghxnlHXyIQ/u1cF9G2BIwRUY');
  });

  it('should extract the session signature', () => {
    expect(cookie.extractSignature(fakeData.__SID)).to.equal('rWnghxnlHXyIQ/u1cF9G2BIwRUY');
  });

  it('should extract the session Id', () => {
    expect(cookie.extractSessionId(fakeData.__SID)).to.equal('QX3ns3vmXin3pzOwvMK4E+cgUj+8');
  });

  it('should validate the cookie signature', () => {
    expect(cookie.validateCookieSignature(fakeData.__SID, fakeData.cookieSecret)).to.equal(true);
  });

  it('should generate the fully decoded session Id', () => {
    process.env.COOKIE_SECRET = fakeData.cookieSecret;
    expect(cookie.getSessionId(mock.request.cookies)).to.equal('QX3ns3vmXin3pzOwvMK4E+cgUj+8');
  });

});
