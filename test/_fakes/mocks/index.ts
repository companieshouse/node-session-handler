import * as fakeData from '../data';
const Mock = {
  request: {
    cookies: {
      __SID: fakeData.__SID
    }
  },
  response: {
    locals: {}
  }
};

export = Mock;
