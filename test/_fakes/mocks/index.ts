import * as fakeData from '../data';
const Mock = {
  request: {
    cookies: {
      __SID: fakeData.__SID
    }
  },
  response: {
    locals: {
      session: {
        appData: {
          some_key: 'some_value'
        },
        accountData: {
          '.client.signature': '1044244f929e811cf2361d5e314b9553dda4c389',
          '.id': 'Jaw2Kigqi7zgGhVjle9OjPZzX0wI',
          '.oauth2_nonce': 'Pyina9c',
          expires: 1591140049,
          last_access: 1591136449,
          pst: 'all'
        }
      }
    }
  }
};

export = Mock;
