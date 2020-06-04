import * as fakeData from '../data';

export const cookie = {
  getSessionId: function (request: object): any {
      return fakeData.sessionId;
    }
  };

export const cache = {
  _setClient: function (): void {},
  set: function (key: string, value: string, ttl: number): Promise<boolean> {
    return Promise.resolve(true);
  },
  get: function (key: string): Promise<any> {
    let r = '';
    if(key !== fakeData.sessionId) {
      r = JSON.stringify(fakeData.sessionData);
    } else {
      r = fakeData.cacheResultAccount;
    }
    return Promise.resolve(r);
  },
  delete: function (key: string): Promise<boolean> {
    return Promise.resolve(true);
  }
};

export const redisClient = {
  set: function (key: string, value: string, ttl: number): Promise<boolean> {
    return Promise.resolve(true);
  },
  get: function (key: string): Promise<any> {
    return Promise.resolve(fakeData.sessionDataString);
  },
  del: function (key: string): Promise<boolean> {
    return Promise.resolve(true);
  }
};
