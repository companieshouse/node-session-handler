
# node-session-handler

Module provides a way of handling Companies House sessions for node apps.

## Prerequisite

Module requires `request.cookies` map to be populated with an object keyed by the cookie names. It can be achieved by use of [cookie-parser](https://www.npmjs.com/package/cookie-parser) module.

In short run `npm install cookie-parser` command to install dependency and add the following snipped to the application to apply cookie parsing middleware:

```$typescript
import * as cookieParser from 'cookie-parser'
...
app.use(cookieParser())
```
## Installation

Add the following to `package.json`:

```$json
"ch-node-session-handler": "git+ssh://git@github.com/companieshouse/node-session-handler.git#4.0.0"
```

..and run `npm install`

## Config

- Ensure you have the config variable `SESSION_APP_KEY` set in your app config - it must contain the unique name of your app. This value must only contain letters, numbers and underscores, but must start with a letter. For example:
```
SESSION_APP_KEY=lfp_appeals_frontend
```
Please be sure that this value is unique enough so as not to overwrite another app's data in Redis

- Also make sure that the value set in the global config parameter `CACHE_SERVER` is sufficient for your needs. You might want to overwrite in your app config to use a self-configured host.

## Usage

### Bootstrapping

In your express bootstrap file, usually `app.ts` or `server.ts` for most apps, add the following to your require section:
```
import session from 'ch-node-session-handler';
```

..and then:

```
app.use((req, res, next) => {
  session.start(req, res)
    .then(_ => { next(); })
    .catch(err => { logger.error(err); next(); });
}
```

The `session.start()` method is used to fire up the session for the current request/response cycle and will drop your currently available session data in `res.locals.session` which you can now access at any point in your code.

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
myAppSessionData = {some_key: "some_value"}`
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
...where `res` is the response object.  The above data will now be available in `res.locals.session.appData`

### Updating session data

In order to update or add new data to the existing session session data , we would do the following:
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

Session data is read in directly by accessing `res.locals.session` due to the fact that this variable is populated during the session bootstrap, i.e. `session.start()`.

The object returned will have to top-level keys: `appData` and `accountData`. By now, we all know what each of these represent.

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
  All your app session data will be removed from`res.locals` and also deleted from the cache.

## Linting and testing

Run `npm test` for unit tests.

Run `npm run lint` to lint.

## Compiling and packaging

At this point no NPM registry is in use and built packages are stored directly in the repository.

For that reason every source code change should be compiled using `npm run build`. The build artefacts in the `lib` directory should be committed alongside initial code change.  
