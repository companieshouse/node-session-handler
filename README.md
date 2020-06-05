


# node-session-handler

The `node-session-handler` provides a means by which Companies House sessions are managed for node apps.

## Prerequisites

It's required that you install the `cookie-parser` module in your app in order that the `Cookie` header is correctly parsed.  This will populate `req.cookies` with an object keyed by the cookie names.

```
npm install cookie-parser
```
...and in your bootstrap file:

```$typescript
import * as cookieParser from 'cookie-parser'
```
Now, bind to your middleware:
```
app.use(cookieParser())
```

## Installation

To install the `node-session-handler`, add the following to `package.json`:

```$json
"ch-node-session-handler": "git+ssh://git@github.com/companieshouse/node-session-handler.git#task/proof-of-concept"
```

..and run `npm install`

## Config

- Ensure you have the config variable `SESSION_APP_KEY` set in your app config - it must contain the unique name of your app. This value must only contain letters, numbers and underscores, but must start with a letter. For example:
	```
	SESSION_APP_KEY=lfp_appeals_frontend
	```
	>Please be sure that this value is unique enough so as not to overwrite another app's data in Redis.

- Also make sure that the value set in the global config parameter `CACHE_SERVER` is sufficient for your needs. You might want to overwrite it in your app config to use a self-configured Redis host. At any rate, ensure that this is the same host that accounts data is written to.
- For a standard CH Vagrant install, the default Redis settings in `CACHE_SERVER`should suffice.

## Usage

### Bootstrapping

In your Express bootstrap file (usually `app.ts` or `server.ts` for most apps), add the following to your require section:
```
import session from 'ch-node-session-handler';
```

..and then:

```
app.use((req, res, next) => {
  session.start(req, res)
    .then(_ => {
       next();
     }).catch(err => {
       // handle error
       next();
     });
}
```

The `session.start()` method is used to fire up the session for the current request/response cycle and will fetch your currently available session data from Redis and add it to`res.locals.session` for fast and easy access for the current request/response cycle.

The `res.locals.session` object is in the format below:

```
  {
    accountData: { ... }, // contains read-only session data from accounts
    appData: { ... }
  }
```

`accountData` contains read-only session data from accounts whereas `appData` will be used to hold session data for your app.

### Writing data to the session

To reiterate, all data written by your app to the session will be stored in the `appData` stanza of the session object. So, assuming you  had an object:

```
const myAppSessionData = {some_key: "some_value"}
```

To write the above data to session, we'd do the following:
```
session.write(res, myAppSessionData)
  .then(
    // proceed with program flow
  ).catch(err => {
    // handle error
  });
```
...where `res` is the response object.

The above app data will now be immediately available in `res.locals.session.appData` whilst account data can be accessed from `res.locals.session.accountData`

A copy of this new data is saved to Redis for subsequent requests.

### Updating session data

In order to update or add new data to the existing app session data , we would do the following:
```
let o = res.locals.session.appData;
// manipulate the data here as you please, then:
session.write(res, o)
  .then(
    // proceed with program flow
  ).catch(err => {
    // handle error
  });
```

### Reading session data

Session data is directly accessible via `res.locals.session` for the current request/response cycle -- having been populated during session bootstrap when `session.start()` was called.

The object returned will have two top-level keys: `appData` and `accountData`. By now, we all know what each of these represent.

### Deleting session data

To delete existing session session data , run:
  ```
session.delete(res)
    .then(
      // proceed with program flow
     ).catch(err => {
      // handle error
     });
```
  All your app session data will be removed from `res.locals` and also deleted from the cache.

## Error handling

Care has been taken to ensure that errors in the `node-session-handler` are not terminal for your app but rather handled gracefully. Please let the module authors know of any terminal errors in your app arising from integration with this module for a timely fix.

 In any case, if working locally, all session-handler errors will be logged to your console so please monitor it for any issues or to triage bugs.

For all forward environments, errors will be logged to the standard log files as defined by the platform team.

## Linting and testing

Run `npm test` for unit tests and `npm run test:coverage` to get a coverage report.

Run `npm run lint` to lint and `npm run lint:autofix` to automatically fix minor linting errors.

## Compiling and packaging

At this point no NPM registry is in use and built packages are stored directly in the repository.

For that reason every source code change should be followed by a code compilation using `npm run build`. The built artefacts in the `lib` directory should be committed alongside your code changes.  

## To-do
 - [] Detach cache handling from this module into separate module
 - [] Bump up test coverage
