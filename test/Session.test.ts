import 'mocha';
import chai, { expect } from 'chai';
chai.use(require('chai-as-promised'));

import * as fakeData from './_fakes/data';
import * as mock from './_fakes/mocks';
import * as stub from './_fakes/stubs';

import * as session from '../src/Session';

describe('Session module', () => {

  it('should start the session', async () => {
    session.cookie = stub.cookie;
    session.cache = stub.cache;
    let r = await session.start(mock.request, mock.response);
    expect(r).to.equal(true);
  });

  it('should read in session data', () => {
    expect(mock.response.locals).to.have.own.property('session');
    expect(mock.response.locals).to.have.nested.property('session.appData');
    expect(mock.response.locals).to.have.nested.property('session.accountData');
    expect(mock.response.locals).to.have.nested.property('session.appData.some_key');
  });

  it('should write data to the session', async () => {
    let r = await session.write(mock.response, fakeData.sessionData);
    expect(r).to.equal(true);
  });

  it('should delete data from the session', async () => {
    let r = await session.delete(mock.response);
    expect(r).to.equal(true);
  });

  it('should retrieve the sessionId', async () => {
    let r = await session.getId(mock.response);
    expect(r).to.equal('Jaw2Kigqi7zgGhVjle9OjPZzX0wI');
  });

  it('should confirm user is not logged in', async () => {
    let r = await session.isLoggedIn(mock.response);
    expect(r).to.equal(false);
  });

  it('should decode account data from cache', () => {
    let r = session._decodeAccountData(fakeData.cacheResultAccount);
    expect(r).to.have.own.property('.client.signature');
    expect(r).to.have.own.property('.id');
    expect(r).to.have.own.property('.oauth2_nonce');
    expect(r).to.have.own.property('expires');
    expect(r).to.have.own.property('last_access');
    expect(r).to.have.own.property('pst');
  });

});
