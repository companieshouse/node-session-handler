import 'mocha';
import { expect } from 'chai';

import * as stub from './_fakes/stubs';

import * as cache from '../src/Cache';

describe('Cache module', () => {

  it('should correctly set the client', () => {
    cache.client = stub.redisClient;
    expect(cache._setClient()).to.equal(undefined);
  });

  it('should commit a value to cache', async () => {
    let r = await cache.set('key', { some_key: 'some_value' });
    expect(r).to.equal(true);
  });

  it('should get a value from cache', async () => {
    let r = await cache.get('key');
    expect(r).to.equal('{"some_key":"some_value"}');
  });

  it('should delete a value from cache', async () => {
    let r = await cache.delete('key');
    expect(r).to.equal(true);
  });

});
