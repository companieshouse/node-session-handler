import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as sinon from 'sinon';
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

import * as cookie from '../src/Cookie';

import * as fakeData from './_fakes/data';
import * as mock from './_fakes/mocks';
import * as stub from './_fakes/stubs';

import * as session from '../src/Session';

describe('Session module', () => {

  it('should initialise the default members of the session object', () => {
    session.cookie = stub.cookie;
    expect(session._setUp(mock.request)).to.equal(undefined);
    expect(session).to.have.own.property('sessionData');
    expect(session).to.have.own.property('sessionId').to.equal('QX3ns3vmXin3pzOwvMK4E+cgUj+8');
  });

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
    //expect(mock.response.locals).to.have.nested.property('session.accountData.expires');
  });

  it('should write data to the session', async () => {
    let r = await session.write(mock.response, fakeData.sessionData);
    expect(r).to.equal(true);
  });

  it('should delete data from the session', async () => {
    let r = await session.delete(mock.response);
    expect(r).to.equal(true);
  });

  it('should decode account data from cache', () => {
    let r = session.decodeAccountData(fakeData.cacheResultAccount);
    expect(r).to.have.own.property('.client.signature');
    expect(r).to.have.own.property('.id');
    expect(r).to.have.own.property('.oauth2_nonce');
    expect(r).to.have.own.property('expires');
    expect(r).to.have.own.property('last_access');
    expect(r).to.have.own.property('pst');
  });

});
